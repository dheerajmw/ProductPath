import { prisma } from "@productpath/database";
import { ReviewDecision, SubmissionStatus } from "@prisma/client";
import { writeAudit } from "../lib/audit";
import { ProjectError } from "./project.service";

export class ReviewError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "ReviewError";
  }
}

type ProjectPolicy = {
  projects: { min_rejection_feedback_chars: number };
};

type Rubric = {
  criteria: { key: string; label: string; required: boolean; maxScore: number }[];
};

async function getPolicy(): Promise<ProjectPolicy> {
  const row = await prisma.appConfig.findUnique({ where: { key: "verification_policy" } });
  const defaults: ProjectPolicy = { projects: { min_rejection_feedback_chars: 100 } };
  if (!row?.value) return defaults;
  return { ...defaults, ...(row.value as object) } as ProjectPolicy;
}

function validateRubric(rubric: Rubric, scores: Record<string, number>) {
  for (const c of rubric.criteria) {
    if (c.required && scores[c.key] === undefined) {
      throw new ReviewError(`Missing rubric score: ${c.label}`, 400, "RUBRIC_INCOMPLETE");
    }
    const score = scores[c.key];
    if (score !== undefined && (score < 0 || score > c.maxScore)) {
      throw new ReviewError(`Invalid score for ${c.label}`, 400, "RUBRIC_INVALID");
    }
  }
}

export async function getReviewerQueue() {
  const items = await prisma.projectSubmission.findMany({
    where: { status: SubmissionStatus.UNDER_REVIEW },
    orderBy: { submittedAt: "asc" },
    include: {
      template: { select: { slug: true, title: true, rubric: true } },
      user: { select: { id: true, email: true, candidateProfile: { select: { displayName: true } } } },
    },
  });

  return {
    queue: items.map((s) => ({
      id: s.id,
      version: s.version,
      title: s.title,
      submittedAt: s.submittedAt?.toISOString(),
      template: { slug: s.template.slug, title: s.template.title },
      candidate: {
        id: s.user.id,
        email: s.user.email,
        displayName: s.user.candidateProfile?.displayName,
      },
      rubric: s.template.rubric,
    })),
  };
}

export async function getSubmissionForReview(submissionId: string) {
  const sub = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: {
      template: true,
      user: { select: { id: true, email: true, candidateProfile: { select: { displayName: true } } } },
      reviews: { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { email: true } } } },
    },
  });
  if (!sub) {
    throw new ReviewError("Submission not found", 404);
  }
  return {
    submission: {
      id: sub.id,
      version: sub.version,
      status: sub.status,
      title: sub.title,
      narrative: sub.narrative,
      artifacts: sub.artifacts,
      submittedAt: sub.submittedAt?.toISOString(),
    },
    template: {
      slug: sub.template.slug,
      title: sub.template.title,
      instructions: sub.template.instructions,
      rubric: sub.template.rubric,
    },
    candidate: {
      id: sub.user.id,
      email: sub.user.email,
      displayName: sub.user.candidateProfile?.displayName,
    },
    reviews: sub.reviews.map((r) => ({
      id: r.id,
      decision: r.decision,
      feedback: r.feedback,
      rubricScores: r.rubricScores,
      reviewerEmail: r.reviewer.email,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function submitReview(
  reviewerId: string,
  input: {
    submissionId: string;
    decision: "APPROVED" | "REJECTED";
    feedback: string;
    rubricScores: Record<string, number>;
  },
) {
  const sub = await prisma.projectSubmission.findUnique({
    where: { id: input.submissionId },
    include: { template: true },
  });
  if (!sub) {
    throw new ReviewError("Submission not found", 404);
  }
  if (sub.status !== SubmissionStatus.UNDER_REVIEW) {
    throw new ReviewError("Submission is not awaiting review", 400, "NOT_IN_REVIEW");
  }

  const policy = await getPolicy();
  const rubric = sub.template.rubric as Rubric;
  validateRubric(rubric, input.rubricScores);

  if (input.decision === "REJECTED" && input.feedback.trim().length < policy.projects.min_rejection_feedback_chars) {
    throw new ReviewError(
      `Rejection feedback must be at least ${policy.projects.min_rejection_feedback_chars} characters`,
      400,
      "FEEDBACK_TOO_SHORT",
    );
  }

  const decision =
    input.decision === "APPROVED" ? ReviewDecision.APPROVED : ReviewDecision.REJECTED;
  const newStatus =
    input.decision === "APPROVED" ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;

  const [review] = await prisma.$transaction([
    prisma.submissionReview.create({
      data: {
        submissionId: sub.id,
        reviewerId,
        decision,
        feedback: input.feedback,
        rubricScores: input.rubricScores,
      },
    }),
    prisma.projectSubmission.update({
      where: { id: sub.id },
      data: { status: newStatus },
    }),
  ]);

  await writeAudit({
    userId: reviewerId,
    action: `project.review.${input.decision.toLowerCase()}`,
    entity: "ProjectSubmission",
    entityId: sub.id,
    metadata: { reviewId: review.id, version: sub.version },
  });

  const { evaluateVerification } = await import("./verification.service.js");
  await evaluateVerification(sub.userId).catch(() => {
    /* verification is best-effort on review */
  });

  return { review: { id: review.id, decision: review.decision, createdAt: review.createdAt.toISOString() } };
}

export async function reverseApproval(adminId: string, submissionId: string, reason: string) {
  const sub = await prisma.projectSubmission.findUnique({ where: { id: submissionId } });
  if (!sub) {
    throw new ReviewError("Submission not found", 404);
  }
  if (sub.status !== SubmissionStatus.APPROVED) {
    throw new ReviewError("Only approved submissions can be reversed", 400);
  }
  if (reason.trim().length < 20) {
    throw new ReviewError("Reversal reason required", 400);
  }

  await prisma.$transaction([
    prisma.submissionReview.create({
      data: {
        submissionId,
        reviewerId: adminId,
        decision: ReviewDecision.REVERSED,
        feedback: reason,
        rubricScores: {},
      },
    }),
    prisma.projectSubmission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.REJECTED },
    }),
  ]);

  await writeAudit({
    userId: adminId,
    action: "project.review.reversed",
    entity: "ProjectSubmission",
    entityId: submissionId,
    metadata: { reason },
  });

  const { evaluateVerification } = await import("./verification.service.js");
  await evaluateVerification(sub.userId).catch(() => undefined);

  return { ok: true };
}

export { ProjectError };
