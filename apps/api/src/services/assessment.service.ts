import { prisma } from "@productpath/database";
import { AttemptStatus } from "@prisma/client";
import { getLearningProgressPercent } from "./learning.service";
import { generateRecommendationsFromAttempt } from "./recommendation.service";
import { writeAudit } from "../lib/audit";

export class AssessmentError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "AssessmentError";
  }
}

type PolicyConfig = {
  verification: { overall_pass_threshold: number; skill_floor_threshold: number };
  assessment: { max_attempts_per_version: number; cooldown_days: number; abandon_attempt_hours: number };
  learning: { assessment_warn_progress_pct: number; assessment_block_progress_pct: number };
};

async function getPolicy(): Promise<PolicyConfig> {
  const row = await prisma.appConfig.findUnique({ where: { key: "verification_policy" } });
  const defaults: PolicyConfig = {
    verification: { overall_pass_threshold: 70, skill_floor_threshold: 50 },
    assessment: { max_attempts_per_version: 3, cooldown_days: 7, abandon_attempt_hours: 24 },
    learning: { assessment_warn_progress_pct: 50, assessment_block_progress_pct: 25 },
  };
  if (!row?.value) return defaults;
  return { ...defaults, ...(row.value as object) } as PolicyConfig;
}

async function getActiveRoleId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile?.activeRoleId) {
    throw new AssessmentError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }
  return profile.activeRoleId;
}

async function getPublishedAssessment(roleId: string) {
  const assessment = await prisma.assessment.findFirst({
    where: { roleId, published: true },
    orderBy: { version: "desc" },
    include: { role: { select: { id: true, slug: true, name: true } } },
  });
  if (!assessment) {
    throw new AssessmentError("No assessment available for your role", 404, "ASSESSMENT_NOT_FOUND");
  }
  return assessment;
}

async function expireStaleAttempts(userId: string, assessmentId: string) {
  const now = new Date();
  await prisma.assessmentAttempt.updateMany({
    where: {
      userId,
      assessmentId,
      status: AttemptStatus.IN_PROGRESS,
      expiresAt: { lt: now },
    },
    data: { status: AttemptStatus.EXPIRED },
  });
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function getRetakeInfo(userId: string, assessmentId: string, policy: PolicyConfig) {
  const submitted = await prisma.assessmentAttempt.findMany({
    where: { userId, assessmentId, status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.EXPIRED] } },
    orderBy: { submittedAt: "desc" },
  });

  const attemptsUsed = submitted.length;
  const maxAttempts = policy.assessment.max_attempts_per_version;

  let cooldownEndsAt: Date | null = null;
  if (submitted[0]?.submittedAt) {
    cooldownEndsAt = addDays(submitted[0].submittedAt, policy.assessment.cooldown_days);
  }

  const now = new Date();
  const inCooldown = cooldownEndsAt ? now < cooldownEndsAt : false;
  const canStart = attemptsUsed < maxAttempts && !inCooldown;

  return { attemptsUsed, maxAttempts, cooldownEndsAt, canStart, inCooldown };
}

export async function getAssessmentHub(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const assessment = await getPublishedAssessment(roleId);
  const policy = await getPolicy();

  await expireStaleAttempts(userId, assessment.id);

  const progressPercent = await getLearningProgressPercent(userId);
  const warnThreshold = policy.learning.assessment_warn_progress_pct;
  const blockThreshold = policy.learning.assessment_block_progress_pct;

  const learningGate = {
    progressPercent: progressPercent ?? 0,
    warn: progressPercent !== null && progressPercent < warnThreshold,
    blocked: progressPercent !== null && progressPercent < blockThreshold,
    warnThreshold,
    blockThreshold,
  };

  const retake = await getRetakeInfo(userId, assessment.id, policy);

  const activeAttempt = await prisma.assessmentAttempt.findFirst({
    where: { userId, assessmentId: assessment.id, status: AttemptStatus.IN_PROGRESS },
  });

  const latestResult = await prisma.assessmentResult.findFirst({
    where: { userId, roleId },
    orderBy: { createdAt: "desc" },
    select: { id: true, overallScore: true, passed: true, createdAt: true, attemptId: true },
  });

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      durationMinutes: assessment.durationMinutes,
      version: assessment.version,
    },
    role: assessment.role,
    learningGate,
    retake,
    activeAttempt: activeAttempt
      ? { id: activeAttempt.id, expiresAt: activeAttempt.expiresAt.toISOString() }
      : null,
    latestResult: latestResult
      ? {
          ...latestResult,
          createdAt: latestResult.createdAt.toISOString(),
        }
      : null,
  };
}

export async function startAttempt(userId: string, assessmentId: string) {
  const roleId = await getActiveRoleId(userId);
  const policy = await getPolicy();
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });

  if (!assessment || assessment.roleId !== roleId || !assessment.published) {
    throw new AssessmentError("Assessment not found", 404);
  }

  const progressPercent = await getLearningProgressPercent(userId);
  if (
    progressPercent !== null &&
    progressPercent < policy.learning.assessment_block_progress_pct
  ) {
    throw new AssessmentError(
      `Complete at least ${policy.learning.assessment_block_progress_pct}% of your learning roadmap before starting.`,
      403,
      "LEARNING_GATE_BLOCKED",
    );
  }

  await expireStaleAttempts(userId, assessmentId);

  const existing = await prisma.assessmentAttempt.findFirst({
    where: { userId, assessmentId, status: AttemptStatus.IN_PROGRESS },
  });
  if (existing) {
    return getAttemptForUser(userId, existing.id);
  }

  const retake = await getRetakeInfo(userId, assessmentId, policy);
  if (!retake.canStart) {
    if (retake.attemptsUsed >= retake.maxAttempts) {
      throw new AssessmentError("Maximum attempts reached", 403, "MAX_ATTEMPTS_REACHED");
    }
    throw new AssessmentError(
      `You can retake after ${retake.cooldownEndsAt?.toISOString()}`,
      403,
      "RETAKE_COOLDOWN",
    );
  }

  const startedAt = new Date();
  const attempt = await prisma.assessmentAttempt.create({
    data: {
      userId,
      assessmentId,
      roleId,
      assessmentVersion: assessment.version,
      startedAt,
      expiresAt: addMinutes(startedAt, assessment.durationMinutes),
    },
  });

  await writeAudit({
    userId,
    action: "assessment.attempt_started",
    entity: "AssessmentAttempt",
    entityId: attempt.id,
  });

  return getAttemptForUser(userId, attempt.id);
}

export async function getAttemptForUser(userId: string, attemptId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: true,
      answers: true,
    },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new AssessmentError("Attempt not found", 404);
  }

  if (attempt.status === AttemptStatus.IN_PROGRESS && attempt.expiresAt < new Date()) {
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.EXPIRED },
    });
    throw new AssessmentError("Assessment time has expired", 410, "ATTEMPT_EXPIRED");
  }

  const questions = await prisma.question.findMany({
    where: { assessmentId: attempt.assessmentId },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      prompt: true,
      options: true,
      sortOrder: true,
      skillId: true,
    },
  });

  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const now = new Date();
  const secondsRemaining = Math.max(
    0,
    Math.floor((attempt.expiresAt.getTime() - now.getTime()) / 1000),
  );

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      expiresAt: attempt.expiresAt.toISOString(),
      secondsRemaining,
      currentQuestionIndex: attempt.currentQuestionIndex,
    },
    assessment: {
      title: attempt.assessment.title,
      durationMinutes: attempt.assessment.durationMinutes,
    },
    questions: questions.map((q) => {
      const ans = answerMap.get(q.id);
      return {
        id: q.id,
        prompt: q.prompt,
        options: q.options as string[],
        sortOrder: q.sortOrder,
        answered: ans?.selectedIndex != null,
        selectedIndex: ans?.selectedIndex ?? null,
      };
    }),
  };
}

export async function saveAnswer(
  userId: string,
  attemptId: string,
  questionId: string,
  selectedIndex: number,
  currentQuestionIndex?: number,
) {
  const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== userId) {
    throw new AssessmentError("Attempt not found", 404);
  }
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    throw new AssessmentError("Attempt is not active", 400, "ATTEMPT_NOT_ACTIVE");
  }
  if (attempt.expiresAt < new Date()) {
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.EXPIRED },
    });
    throw new AssessmentError("Assessment time has expired", 410, "ATTEMPT_EXPIRED");
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, assessmentId: attempt.assessmentId },
  });
  if (!question) {
    throw new AssessmentError("Question not found", 404);
  }

  const options = question.options as string[];
  if (selectedIndex < 0 || selectedIndex >= options.length) {
    throw new AssessmentError("Invalid answer index", 400);
  }

  await prisma.attemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, selectedIndex },
    update: { selectedIndex },
  });

  if (currentQuestionIndex !== undefined) {
    await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: { currentQuestionIndex },
    });
  }

  return getAttemptForUser(userId, attemptId);
}

function scoreAttempt(
  questions: { id: string; skillId: string; correctIndex: number; skill: { id: string; name: string; slug: string } }[],
  answers: { questionId: string; selectedIndex: number | null }[],
) {
  const bySkill = new Map<string, { name: string; slug: string; correct: number; total: number }>();

  for (const q of questions) {
    const entry = bySkill.get(q.skillId) ?? {
      name: q.skill.name,
      slug: q.skill.slug,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    const ans = answers.find((a) => a.questionId === q.id);
    if (ans?.selectedIndex === q.correctIndex) entry.correct += 1;
    bySkill.set(q.skillId, entry);
  }

  const scoresBySkill = Array.from(bySkill.entries()).map(([skillId, v]) => ({
    skillId,
    skillName: v.name,
    skillSlug: v.slug,
    score: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    correct: v.correct,
    total: v.total,
  }));

  const overallScore =
    scoresBySkill.length > 0
      ? Math.round(scoresBySkill.reduce((s, x) => s + x.score, 0) / scoresBySkill.length)
      : 0;

  return { scoresBySkill, overallScore };
}

export async function submitAttempt(userId: string, attemptId: string) {
  const policy = await getPolicy();
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: true },
  });

  if (!attempt || attempt.userId !== userId) {
    throw new AssessmentError("Attempt not found", 404);
  }
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    throw new AssessmentError("Attempt already submitted", 400, "ALREADY_SUBMITTED");
  }

  const now = new Date();
  const expired = attempt.expiresAt < now;

  const questions = await prisma.question.findMany({
    where: { assessmentId: attempt.assessmentId },
    include: { skill: { select: { id: true, name: true, slug: true } } },
  });

  const { scoresBySkill, overallScore } = scoreAttempt(questions, attempt.answers);

  const floor = policy.verification.skill_floor_threshold;
  const threshold = policy.verification.overall_pass_threshold;
  const passed =
    !expired &&
    overallScore >= threshold &&
    scoresBySkill.every((s) => s.score >= floor);

  await prisma.$transaction([
    prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: expired ? AttemptStatus.EXPIRED : AttemptStatus.SUBMITTED,
        submittedAt: now,
      },
    }),
    prisma.assessmentResult.create({
      data: {
        attemptId,
        userId,
        roleId: attempt.roleId,
        overallScore,
        passed,
        scoresBySkill,
      },
    }),
  ]);

  await writeAudit({
    userId,
    action: "assessment.submitted",
    entity: "AssessmentAttempt",
    entityId: attemptId,
    metadata: { overallScore, passed },
  });

  await generateRecommendationsFromAttempt(userId, attemptId).catch(() => {
    /* recommendations are best-effort on submit */
  });

  const { evaluateVerification } = await import("./verification.service.js");
  await evaluateVerification(userId).catch(() => {
    /* verification is best-effort on submit */
  });

  return getResultForAttempt(userId, attemptId);
}

export async function getResultForAttempt(userId: string, attemptId: string) {
  const result = await prisma.assessmentResult.findUnique({
    where: { attemptId },
    include: {
      attempt: { include: { assessment: true } },
    },
  });

  if (!result || result.userId !== userId) {
    throw new AssessmentError("Result not found", 404);
  }

  const policy = await getPolicy();
  const scores = result.scoresBySkill as {
    skillId: string;
    skillName: string;
    skillSlug: string;
    score: number;
  }[];

  const floor = policy.verification.skill_floor_threshold;
  const gaps = scores
    .filter((s) => s.score < floor)
    .map((s) => ({
      skillId: s.skillId,
      skillName: s.skillName,
      skillSlug: s.skillSlug,
      score: s.score,
      floor,
      gap: floor - s.score,
    }));

  return {
    result: {
      id: result.id,
      attemptId: result.attemptId,
      overallScore: result.overallScore,
      passed: result.passed,
      createdAt: result.createdAt.toISOString(),
      assessmentTitle: result.attempt.assessment.title,
    },
    scoresBySkill: scores,
    gaps,
  };
}

export async function getResultsHistory(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const results = await prisma.assessmentResult.findMany({
    where: { userId, roleId },
    orderBy: { createdAt: "desc" },
    include: { attempt: { include: { assessment: { select: { title: true } } } } },
  });

  return {
    results: results.map((r) => ({
      id: r.id,
      attemptId: r.attemptId,
      overallScore: r.overallScore,
      passed: r.passed,
      createdAt: r.createdAt.toISOString(),
      assessmentTitle: r.attempt.assessment.title,
    })),
  };
}

export async function getGaps(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const latest = await prisma.assessmentResult.findFirst({
    where: { userId, roleId },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    throw new AssessmentError("Complete an assessment first", 404, "NO_RESULTS");
  }

  const detail = await getResultForAttempt(userId, latest.attemptId);
  return {
    gaps: detail.gaps,
    overallScore: detail.result.overallScore,
    passed: detail.result.passed,
    latestResultId: detail.result.id,
    latestAttemptId: detail.result.attemptId,
  };
}
