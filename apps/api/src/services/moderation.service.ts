import { prisma } from "@productpath/database";
import {
  ModerationActionType,
  PostStatus,
  ReportStatus,
  ReportTargetType,
} from "@prisma/client";
import { escapeHtml } from "@productpath/shared";
import { writeAudit } from "../lib/audit.js";

export class ModerationError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "ModerationError";
  }
}

export async function listReports(status: ReportStatus = ReportStatus.PENDING) {
  const reports = await prisma.report.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      reporter: { select: { email: true } },
      post: {
        select: {
          id: true,
          body: true,
          type: true,
          status: true,
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

  const enriched = await Promise.all(
    reports.map(async (r) => {
      let targetPreview: string | null = null;
      if (r.targetType === ReportTargetType.COMMENT) {
        const comment = await prisma.comment.findUnique({
          where: { id: r.targetId },
          select: { body: true },
        });
        targetPreview = comment?.body ?? null;
      } else if (r.post) {
        targetPreview = r.post.body;
      }

      return {
        id: r.id,
        targetType: r.targetType,
        targetId: r.targetId,
        reason: escapeHtml(r.reason),
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        reporter: { email: r.reporter.email },
        post: r.post
          ? {
              id: r.post.id,
              body: escapeHtml(r.post.body),
              type: r.post.type,
              status: r.post.status,
              authorDisplay:
                r.post.author.candidateProfile?.displayName ??
                r.post.author.email.split("@")[0],
            }
          : null,
        targetPreview: targetPreview ? escapeHtml(targetPreview) : null,
      };
    }),
  );

  return { reports: enriched };
}

export async function resolveReport(
  moderatorId: string,
  reportId: string,
  action: "hide_post" | "dismiss",
  note?: string,
) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    throw new ModerationError("Report not found", 404);
  }
  if (report.status !== ReportStatus.PENDING) {
    throw new ModerationError("Report already resolved", 400, "ALREADY_RESOLVED");
  }

  if (action === "dismiss") {
    await prisma.$transaction([
      prisma.report.update({
        where: { id: reportId },
        data: { status: ReportStatus.DISMISSED },
      }),
      prisma.moderationAction.create({
        data: {
          reportId,
          moderatorId,
          action: ModerationActionType.DISMISS_REPORT,
          note: note ?? null,
        },
      }),
    ]);

    await writeAudit({
      userId: moderatorId,
      action: "moderation.report.dismissed",
      entity: "Report",
      entityId: reportId,
    });

    return { status: ReportStatus.DISMISSED };
  }

  let postId = report.postId;
  if (report.targetType === ReportTargetType.POST) {
    postId = report.targetId;
  }

  if (!postId) {
    throw new ModerationError("No post linked to this report", 400);
  }

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.HIDDEN },
    }),
    prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.RESOLVED },
    }),
    prisma.moderationAction.create({
      data: {
        reportId,
        moderatorId,
        action: ModerationActionType.HIDE_POST,
        note: note ?? null,
      },
    }),
  ]);

  await writeAudit({
    userId: moderatorId,
    action: "moderation.post.hidden",
    entity: "Post",
    entityId: postId,
    metadata: { reportId },
  });

  return { status: ReportStatus.RESOLVED, postHidden: true };
}
