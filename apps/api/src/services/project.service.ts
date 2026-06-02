import { prisma } from "@productpath/database";
import { SubmissionStatus } from "@prisma/client";
import { writeAudit } from "../lib/audit";
import {
  buildObjectKey,
  putObject,
  scanBuffer,
  StorageError,
  validateUpload,
} from "../lib/storage";

export class ProjectError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "ProjectError";
  }
}

export type Artifact = {
  type: "FILE" | "URL";
  name: string;
  url: string;
  key?: string;
  sizeBytes?: number;
  contentType?: string;
};

type ProjectPolicy = {
  projects: { max_submission_versions: number; min_rejection_feedback_chars: number };
};

type Rubric = {
  criteria: { key: string; label: string; required: boolean; maxScore: number }[];
};

async function getPolicy(): Promise<ProjectPolicy> {
  const row = await prisma.appConfig.findUnique({ where: { key: "verification_policy" } });
  const defaults: ProjectPolicy = {
    projects: { max_submission_versions: 3, min_rejection_feedback_chars: 100 },
  };
  if (!row?.value) return defaults;
  return { ...defaults, ...(row.value as object) } as ProjectPolicy;
}

async function getActiveRoleId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile?.activeRoleId) {
    throw new ProjectError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }
  return profile.activeRoleId;
}

function parseArtifacts(raw: unknown): Artifact[] {
  if (!Array.isArray(raw)) return [];
  return raw as Artifact[];
}

function serializeSubmission(sub: {
  id: string;
  templateId: string;
  roleId: string;
  version: number;
  status: SubmissionStatus;
  title: string | null;
  narrative: string | null;
  artifacts: unknown;
  parentId: string | null;
  submittedAt: Date | null;
  lockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  template?: { slug: string; title: string; rubric?: unknown };
  reviews?: { id: string; decision: string; feedback: string; createdAt: Date; rubricScores: unknown }[];
}) {
  const latestReview = sub.reviews?.[0];
  return {
    id: sub.id,
    templateId: sub.templateId,
    templateSlug: sub.template?.slug,
    templateTitle: sub.template?.title,
    roleId: sub.roleId,
    version: sub.version,
    status: sub.status,
    title: sub.title,
    narrative: sub.narrative,
    artifacts: parseArtifacts(sub.artifacts),
    parentId: sub.parentId,
    submittedAt: sub.submittedAt?.toISOString() ?? null,
    lockedAt: sub.lockedAt?.toISOString() ?? null,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    editable: sub.status === SubmissionStatus.DRAFT,
    latestReview: latestReview
      ? {
          id: latestReview.id,
          decision: latestReview.decision,
          feedback: latestReview.feedback,
          rubricScores: latestReview.rubricScores,
          createdAt: latestReview.createdAt.toISOString(),
        }
      : null,
  };
}

export async function listTemplatesForUser(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const templates = await prisma.projectTemplate.findMany({
    where: { roleId, published: true },
    orderBy: { sortOrder: "asc" },
  });

  const submissions = await prisma.projectSubmission.findMany({
    where: { userId, roleId },
    orderBy: { version: "desc" },
    include: { template: { select: { slug: true } } },
  });

  const latestByTemplate = new Map<string, (typeof submissions)[0]>();
  for (const s of submissions) {
    if (!latestByTemplate.has(s.templateId)) latestByTemplate.set(s.templateId, s);
  }

  return {
    templates: templates.map((t) => {
      const latest = latestByTemplate.get(t.id);
      return {
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        instructions: t.instructions,
        sortOrder: t.sortOrder,
        latestSubmission: latest
          ? { id: latest.id, status: latest.status, version: latest.version }
          : null,
      };
    }),
  };
}

export async function getTemplateBySlug(userId: string, slug: string) {
  const roleId = await getActiveRoleId(userId);
  const template = await prisma.projectTemplate.findUnique({
    where: { roleId_slug: { roleId, slug } },
  });
  if (!template || !template.published) {
    throw new ProjectError("Project template not found", 404, "TEMPLATE_NOT_FOUND");
  }
  return {
    template: {
      id: template.id,
      slug: template.slug,
      title: template.title,
      description: template.description,
      instructions: template.instructions,
      rubric: template.rubric,
    },
  };
}

export async function listMySubmissions(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const rows = await prisma.projectSubmission.findMany({
    where: { userId, roleId },
    orderBy: [{ templateId: "asc" }, { version: "desc" }],
    include: {
      template: { select: { slug: true, title: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return { submissions: rows.map(serializeSubmission) };
}

export async function getSubmission(userId: string, submissionId: string) {
  const sub = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      template: { select: { slug: true, title: true, instructions: true, rubric: true } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!sub || sub.userId !== userId) {
    throw new ProjectError("Submission not found", 404);
  }
  return {
    submission: serializeSubmission(sub),
    template: {
      slug: sub.template.slug,
      title: sub.template.title,
      instructions: sub.template.instructions,
      rubric: sub.template.rubric as Rubric,
    },
  };
}

async function countVersions(userId: string, templateId: string) {
  return prisma.projectSubmission.count({ where: { userId, templateId } });
}

export async function createSubmission(
  userId: string,
  templateId: string,
  body: { title?: string; narrative?: string; artifactUrls?: Artifact[] },
) {
  const roleId = await getActiveRoleId(userId);
  const template = await prisma.projectTemplate.findUnique({ where: { id: templateId } });
  if (!template || !template.published || template.roleId !== roleId) {
    throw new ProjectError("Template not available for your role", 400, "WRONG_ROLE_TEMPLATE");
  }

  const policy = await getPolicy();
  const versions = await countVersions(userId, templateId);
  if (versions >= policy.projects.max_submission_versions) {
    throw new ProjectError("Maximum submission versions reached", 400, "MAX_VERSIONS_REACHED");
  }

  const activeDraft = await prisma.projectSubmission.findFirst({
    where: {
      userId,
      templateId,
      status: SubmissionStatus.DRAFT,
    },
  });
  if (activeDraft) {
    throw new ProjectError("You already have a draft for this project", 400, "DRAFT_EXISTS");
  }

  const inReview = await prisma.projectSubmission.findFirst({
    where: {
      userId,
      templateId,
      status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.UNDER_REVIEW] },
    },
  });
  if (inReview) {
    throw new ProjectError("A submission is already in review", 400, "IN_REVIEW");
  }

  const last = await prisma.projectSubmission.findFirst({
    where: { userId, templateId },
    orderBy: { version: "desc" },
  });

  if (last?.status === SubmissionStatus.REJECTED) {
    return createResubmission(userId, roleId, templateId, last, body);
  }
  if (last?.status === SubmissionStatus.APPROVED) {
    throw new ProjectError("You already have an approved submission for this project", 400, "ALREADY_APPROVED");
  }
  if (last) {
    throw new ProjectError("Complete or resolve your current submission first", 400);
  }

  const artifacts: Artifact[] = body.artifactUrls ?? [];

  const sub = await prisma.projectSubmission.create({
    data: {
      userId,
      templateId,
      roleId,
      version: 1,
      title: body.title ?? template.title,
      narrative: body.narrative ?? "",
      artifacts,
    },
    include: { template: { select: { slug: true, title: true } } },
  });

  return { submission: serializeSubmission(sub) };
}

async function createResubmission(
  userId: string,
  roleId: string,
  templateId: string,
  rejected: { id: string; version: number },
  body: { title?: string; narrative?: string; artifactUrls?: Artifact[] },
) {
  const policy = await getPolicy();
  const versions = await countVersions(userId, templateId);
  if (versions >= policy.projects.max_submission_versions) {
    throw new ProjectError("Maximum submission versions reached", 400, "MAX_VERSIONS_REACHED");
  }

  const template = await prisma.projectTemplate.findUnique({ where: { id: templateId } });
  const artifacts: Artifact[] = body.artifactUrls ?? [];

  const sub = await prisma.projectSubmission.create({
    data: {
      userId,
      templateId,
      roleId,
      version: rejected.version + 1,
      parentId: rejected.id,
      title: body.title ?? template?.title,
      narrative: body.narrative ?? "",
      artifacts,
    },
    include: { template: { select: { slug: true, title: true } } },
  });

  return { submission: serializeSubmission(sub) };
}

export async function createResubmissionFromRejected(userId: string, submissionId: string) {
  const prev = await prisma.projectSubmission.findUnique({ where: { id: submissionId } });
  if (!prev || prev.userId !== userId) {
    throw new ProjectError("Submission not found", 404);
  }
  if (prev.status !== SubmissionStatus.REJECTED) {
    throw new ProjectError("Only rejected submissions can be resubmitted", 400);
  }
  return createResubmission(userId, prev.roleId, prev.templateId, prev, {});
}

export async function updateSubmission(
  userId: string,
  submissionId: string,
  body: { title?: string; narrative?: string; artifactUrls?: Artifact[] },
) {
  const sub = await prisma.projectSubmission.findUnique({ where: { id: submissionId } });
  if (!sub || sub.userId !== userId) {
    throw new ProjectError("Submission not found", 404);
  }
  if (sub.status !== SubmissionStatus.DRAFT) {
    throw new ProjectError("Submission is locked", 400, "SUBMISSION_LOCKED");
  }

  const existing = parseArtifacts(sub.artifacts);
  const fileArtifacts = existing.filter((a) => a.type === "FILE");
  const urlArtifacts = body.artifactUrls ?? existing.filter((a) => a.type === "URL");

  const updated = await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      title: body.title ?? sub.title,
      narrative: body.narrative ?? sub.narrative,
      artifacts: [...fileArtifacts, ...urlArtifacts],
    },
    include: { template: { select: { slug: true, title: true } } },
  });

  return { submission: serializeSubmission(updated) };
}

export async function submitForReview(userId: string, submissionId: string) {
  const sub = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: { template: true },
  });
  if (!sub || sub.userId !== userId) {
    throw new ProjectError("Submission not found", 404);
  }
  if (sub.status !== SubmissionStatus.DRAFT) {
    throw new ProjectError("Only drafts can be submitted", 400);
  }

  const roleId = await getActiveRoleId(userId);
  if (sub.roleId !== roleId || sub.template.roleId !== roleId) {
    throw new ProjectError("Template does not match your active role", 400, "WRONG_ROLE_TEMPLATE");
  }

  const narrative = (sub.narrative ?? "").trim();
  const artifacts = parseArtifacts(sub.artifacts);
  if (narrative.length < 50 && artifacts.length === 0) {
    throw new ProjectError("Add a narrative or at least one artifact before submitting", 400, "EMPTY_SUBMISSION");
  }

  const now = new Date();
  const updated = await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      status: SubmissionStatus.UNDER_REVIEW,
      submittedAt: now,
      lockedAt: now,
    },
    include: { template: { select: { slug: true, title: true } } },
  });

  await writeAudit({
    userId,
    action: "project.submitted",
    entity: "ProjectSubmission",
    entityId: submissionId,
    metadata: { version: sub.version, templateSlug: sub.template.slug },
  });

  return { submission: serializeSubmission(updated) };
}

export async function uploadArtifact(
  userId: string,
  submissionId: string,
  file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
) {
  const sub = await prisma.projectSubmission.findUnique({ where: { id: submissionId } });
  if (!sub || sub.userId !== userId) {
    throw new ProjectError("Submission not found", 404);
  }
  if (sub.status !== SubmissionStatus.DRAFT) {
    throw new ProjectError("Submission is locked", 400, "SUBMISSION_LOCKED");
  }

  try {
    validateUpload(file.originalname, file.size, file.mimetype);
    scanBuffer(file.buffer, file.originalname);
  } catch (e) {
    if (e instanceof StorageError) {
      throw new ProjectError(e.message, e.statusCode, e.code);
    }
    throw e;
  }

  const key = buildObjectKey(userId, submissionId, file.originalname);
  const stored = await putObject({
    key,
    body: file.buffer,
    contentType: file.mimetype,
  });

  const artifacts = parseArtifacts(sub.artifacts);
  artifacts.push({
    type: "FILE",
    name: file.originalname,
    url: stored.url,
    key: stored.key,
    sizeBytes: stored.sizeBytes,
    contentType: stored.contentType,
  });

  const updated = await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: { artifacts },
    include: { template: { select: { slug: true, title: true } } },
  });

  return { submission: serializeSubmission(updated), artifact: artifacts[artifacts.length - 1] };
}

export { StorageError };
