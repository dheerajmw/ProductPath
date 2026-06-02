import { prisma } from "@productpath/database";
import {
  PostStatus,
  PostType,
  ReportTargetType,
  SubmissionStatus,
} from "@prisma/client";
import {
  COMMUNITY_MAX_COMMENT_DEPTH,
  FIELD_LIMITS,
  escapeHtml,
  sanitizeText,
} from "@productpath/shared";
import { writeAudit } from "../lib/audit.js";

export class CommunityError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "CommunityError";
  }
}

type AuthorInfo = {
  id: string;
  displayName: string;
};

async function authorInfo(userId: string): Promise<AuthorInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      candidateProfile: { select: { displayName: true } },
    },
  });
  const name =
    user?.candidateProfile?.displayName ??
    user?.email?.split("@")[0] ??
    "Member";
  return { id: userId, displayName: name };
}

function projectShareMeta(submission: {
  id: string;
  title: string | null;
  status: SubmissionStatus;
} | null) {
  if (!submission) return null;
  const verified = submission.status === SubmissionStatus.APPROVED;
  return {
    submissionId: submission.id,
    title: submission.title,
    status: submission.status,
    verified,
    label: verified ? "Verified proof of work" : "Not verified — work not approved",
  };
}

async function loadSubmissionForPost(projectSubmissionId: string | null) {
  if (!projectSubmissionId) return null;
  return prisma.projectSubmission.findUnique({
    where: { id: projectSubmissionId },
    select: { id: true, title: true, status: true },
  });
}

async function serializePost(
  post: {
    id: string;
    authorId: string;
    type: PostType;
    body: string;
    status: PostStatus;
    projectSubmissionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    projectSubmission?: {
      id: string;
      title: string | null;
      status: SubmissionStatus;
    } | null;
    _count?: { likes: number; comments: number };
  },
  viewerId: string | null,
  likedByViewer?: boolean,
) {
  const author = await authorInfo(post.authorId);
  const submission =
    post.projectSubmission ??
    (post.projectSubmissionId
      ? await loadSubmissionForPost(post.projectSubmissionId)
      : null);

  return {
    id: post.id,
    type: post.type,
    body: escapeHtml(post.body),
    status: post.status,
    author,
    projectShare:
      post.type === PostType.PROJECT_SHARE ? projectShareMeta(submission) : null,
    likeCount: post._count?.likes ?? 0,
    commentCount: post._count?.comments ?? 0,
    likedByViewer: likedByViewer ?? false,
    isAuthor: viewerId === post.authorId,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

async function viewerLikedPostIds(viewerId: string, postIds: string[]) {
  if (!postIds.length) return new Set<string>();
  const likes = await prisma.like.findMany({
    where: { userId: viewerId, postId: { in: postIds } },
    select: { postId: true },
  });
  return new Set(likes.map((l) => l.postId));
}

export async function getFeed(viewerId: string, cursor?: string, limit = 20) {
  const take = Math.min(limit, 50);

  let cursorFilter = {};
  if (cursor) {
    const [createdAtIso, cursorId] = cursor.split("|");
    if (createdAtIso && cursorId) {
      cursorFilter = {
        OR: [
          { createdAt: { lt: new Date(createdAtIso) } },
          { createdAt: new Date(createdAtIso), id: { lt: cursorId } },
        ],
      };
    }
  }

  const posts = await prisma.post.findMany({
    where: {
      status: PostStatus.VISIBLE,
      visibility: "PUBLIC",
      ...cursorFilter,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    include: {
      projectSubmission: { select: { id: true, title: true, status: true } },
      _count: { select: { likes: true, comments: { where: { status: PostStatus.VISIBLE } } } },
    },
  });

  const page = posts.slice(0, take);
  const hasMore = posts.length > take;
  const liked = await viewerLikedPostIds(
    viewerId,
    page.map((p) => p.id),
  );

  const items = await Promise.all(
    page.map((p) => serializePost(p, viewerId, liked.has(p.id))),
  );

  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last ? `${last.createdAt.toISOString()}|${last.id}` : null;

  return { posts: items, nextCursor };
}

export async function createPost(
  userId: string,
  input: { type: "TEXT" | "PROJECT_SHARE"; body: string; projectSubmissionId?: string },
) {
  const body = sanitizeText(input.body, FIELD_LIMITS.postBody);
  if (!body) {
    throw new CommunityError("Post body is required", 400, "EMPTY_BODY");
  }

  let projectSubmissionId: string | null = null;
  if (input.type === "PROJECT_SHARE") {
    if (!input.projectSubmissionId) {
      throw new CommunityError(
        "Project submission required for project share posts",
        400,
        "SUBMISSION_REQUIRED",
      );
    }
    const submission = await prisma.projectSubmission.findUnique({
      where: { id: input.projectSubmissionId },
    });
    if (!submission || submission.userId !== userId) {
      throw new CommunityError("Project submission not found", 404, "SUBMISSION_NOT_FOUND");
    }
    projectSubmissionId = submission.id;
  } else if (input.projectSubmissionId) {
    throw new CommunityError("projectSubmissionId only allowed for PROJECT_SHARE", 400);
  }

  const post = await prisma.post.create({
    data: {
      authorId: userId,
      type: input.type as PostType,
      body,
      projectSubmissionId,
    },
    include: {
      projectSubmission: { select: { id: true, title: true, status: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  await writeAudit({
    userId,
    action: "community.post.created",
    entity: "Post",
    entityId: post.id,
    metadata: { type: post.type },
  });

  return { post: await serializePost(post, userId, false) };
}

export async function getPost(postId: string, viewerId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      projectSubmission: { select: { id: true, title: true, status: true } },
      _count: {
        select: {
          likes: true,
          comments: { where: { status: PostStatus.VISIBLE } },
        },
      },
    },
  });

  if (!post || post.status !== PostStatus.VISIBLE) {
    throw new CommunityError("Post not found", 404, "POST_NOT_FOUND");
  }

  const liked = await prisma.like.findUnique({
    where: { userId_postId: { userId: viewerId, postId } },
  });

  const comments = await listComments(postId);

  return {
    post: await serializePost(post, viewerId, Boolean(liked)),
    comments,
  };
}

type SerializedComment = {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  author: AuthorInfo;
  replies: SerializedComment[];
  createdAt: string;
};

function serializeComment(
  comment: {
    id: string;
    postId: string;
    parentId: string | null;
    body: string;
    createdAt: Date;
  },
  author: AuthorInfo,
  replies: SerializedComment[] = [],
): SerializedComment {
  return {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    body: escapeHtml(comment.body),
    author,
    replies,
    createdAt: comment.createdAt.toISOString(),
  };
}

export async function listComments(postId: string) {
  const roots = await prisma.comment.findMany({
    where: { postId, parentId: null, status: PostStatus.VISIBLE },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: {
          email: true,
          candidateProfile: { select: { displayName: true } },
        },
      },
      replies: {
        where: { status: PostStatus.VISIBLE },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              email: true,
              candidateProfile: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });

  return roots.map((root) => {
    const rootAuthor = {
      id: root.authorId,
      displayName:
        root.author.candidateProfile?.displayName ??
        root.author.email.split("@")[0] ??
        "Member",
    };
    const replyItems = root.replies.map((reply) => {
      const replyAuthor = {
        id: reply.authorId,
        displayName:
          reply.author.candidateProfile?.displayName ??
          reply.author.email.split("@")[0] ??
          "Member",
      };
      return serializeComment(reply, replyAuthor);
    });
    return serializeComment(root, rootAuthor, replyItems);
  });
}

export async function addComment(
  userId: string,
  postId: string,
  input: { body: string; parentId?: string },
) {
  const body = sanitizeText(input.body, FIELD_LIMITS.commentBody);
  if (!body) {
    throw new CommunityError("Comment body is required", 400, "EMPTY_BODY");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.status !== PostStatus.VISIBLE) {
    throw new CommunityError("Post not found", 404, "POST_NOT_FOUND");
  }

  let parentId: string | null = null;
  if (input.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: input.parentId },
    });
    if (!parent || parent.postId !== postId || parent.status !== PostStatus.VISIBLE) {
      throw new CommunityError("Parent comment not found", 404, "PARENT_NOT_FOUND");
    }
    if (parent.parentId) {
      throw new CommunityError(
        `Maximum comment depth is ${COMMUNITY_MAX_COMMENT_DEPTH}`,
        400,
        "MAX_DEPTH",
      );
    }
    parentId = parent.id;
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: userId,
      body,
      parentId,
    },
  });

  await writeAudit({
    userId,
    action: "community.comment.created",
    entity: "Comment",
    entityId: comment.id,
    metadata: { postId },
  });

  const author = await authorInfo(userId);
  return {
    comment: serializeComment(comment, author),
  };
}

export async function toggleLike(userId: string, postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.status !== PostStatus.VISIBLE) {
    throw new CommunityError("Post not found", 404, "POST_NOT_FOUND");
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({ where: { postId } });
    return { liked: false, likeCount: count };
  }

  await prisma.like.create({ data: { userId, postId } });
  const count = await prisma.like.count({ where: { postId } });
  return { liked: true, likeCount: count };
}

export async function createReport(
  reporterId: string,
  input: { targetType: "POST" | "COMMENT"; targetId: string; reason: string },
) {
  const reason = sanitizeText(input.reason, FIELD_LIMITS.reportReason);
  if (reason.length < 10) {
    throw new CommunityError("Please provide a detailed reason (min 10 characters)", 400);
  }

  let postId: string | null = null;

  if (input.targetType === "POST") {
    const post = await prisma.post.findUnique({ where: { id: input.targetId } });
    if (!post) {
      throw new CommunityError("Post not found", 404, "TARGET_NOT_FOUND");
    }
    postId = post.id;
  } else {
    const comment = await prisma.comment.findUnique({ where: { id: input.targetId } });
    if (!comment) {
      throw new CommunityError("Comment not found", 404, "TARGET_NOT_FOUND");
    }
    postId = comment.postId;
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      targetType: input.targetType as ReportTargetType,
      targetId: input.targetId,
      postId,
      reason,
    },
  });

  await writeAudit({
    userId: reporterId,
    action: "community.report.created",
    entity: "Report",
    entityId: report.id,
    metadata: { targetType: input.targetType, targetId: input.targetId },
  });

  return {
    report: {
      id: report.id,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
    },
  };
}
