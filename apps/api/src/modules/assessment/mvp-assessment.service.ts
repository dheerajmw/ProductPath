import { prisma } from "@productpath/database";
import { MvpSessionStatus } from "@prisma/client";
import {
  getQuestionBank,
  getAllRoles,
  ROLE_LABELS,
  buildAssessmentResult,
  scoreMcqOrScenario,
  scoreShortAnswerRuleBased,
  applyAiScore,
  evaluateShortAnswer,
  generateSessionFeedback,
  type BankQuestion,
  type Difficulty,
  type RoleSlug,
} from "@productpath/assessment-mvp";

export class MvpAssessmentError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "MvpAssessmentError";
  }
}

const SESSION_MINUTES = 45;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function loadQuestions(roleSlug: RoleSlug, difficulty: Difficulty): BankQuestion[] {
  return getQuestionBank(roleSlug, difficulty);
}

function questionMap(questions: BankQuestion[]) {
  return new Map(questions.map((q) => [q.id, q]));
}

function toQuestionView(q: BankQuestion, index: number, answered: boolean) {
  return {
    id: q.id,
    index,
    type: q.type,
    question: q.question,
    context: q.context,
    options: q.type !== "short-answer" ? q.options : undefined,
    skillTag: q.skill_tag,
    estimatedTime: q.estimated_time,
    answered,
  };
}

export function listMvpRoles() {
  return getAllRoles().map((slug) => ({
    slug,
    name: ROLE_LABELS[slug],
    difficulties: ["beginner", "intermediate"] as Difficulty[],
  }));
}

export async function startMvpSession(
  userId: string,
  roleSlug: RoleSlug,
  difficulty: Difficulty,
) {
  const questions = loadQuestions(roleSlug, difficulty);
  if (questions.length === 0) {
    throw new MvpAssessmentError("No questions for this role", 404, "NO_QUESTIONS");
  }

  const existing = await prisma.assessmentSession.findFirst({
    where: { userId, roleSlug, status: MvpSessionStatus.IN_PROGRESS },
  });
  if (existing) {
    return getMvpSession(userId, existing.id);
  }

  const startedAt = new Date();
  const session = await prisma.assessmentSession.create({
    data: {
      userId,
      roleSlug,
      difficulty,
      questionIds: questions.map((q) => q.id),
      expiresAt: addMinutes(startedAt, SESSION_MINUTES),
    },
  });

  return getMvpSession(userId, session.id);
}

export async function getMvpSession(userId: string, sessionId: string) {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: { responses: true },
  });

  if (!session || session.userId !== userId) {
    throw new MvpAssessmentError("Session not found", 404);
  }

  const questions = loadQuestions(session.roleSlug as RoleSlug, session.difficulty as Difficulty);
  const qMap = questionMap(questions);
  const answeredIds = new Set(session.responses.map((r) => r.questionBankId));
  const questionIds = session.questionIds as string[];

  const questionViews = questionIds
    .map((id, index) => {
      const q = qMap.get(id);
      if (!q) return null;
      return toQuestionView(q, index, answeredIds.has(id));
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  return {
    session: {
      id: session.id,
      role: session.roleSlug as RoleSlug,
      roleName: ROLE_LABELS[session.roleSlug as RoleSlug],
      difficulty: session.difficulty as Difficulty,
      status: session.status,
      currentIndex: session.currentIndex,
      totalQuestions: questionViews.length,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt?.toISOString(),
    },
    questions: questionViews,
  };
}

export async function submitMvpResponse(
  userId: string,
  sessionId: string,
  input: {
    questionId: string;
    selectedIndex?: number;
    textAnswer?: string;
    currentIndex?: number;
  },
) {
  const session = await prisma.assessmentSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) {
    throw new MvpAssessmentError("Session not found", 404);
  }
  if (session.status !== MvpSessionStatus.IN_PROGRESS) {
    throw new MvpAssessmentError("Session is not active", 400, "SESSION_NOT_ACTIVE");
  }

  const questions = loadQuestions(session.roleSlug as RoleSlug, session.difficulty as Difficulty);
  const question = questions.find((q) => q.id === input.questionId);
  if (!question) {
    throw new MvpAssessmentError("Question not found", 404);
  }

  let scoreRecord =
    question.type === "short-answer"
      ? scoreShortAnswerRuleBased(question, input.textAnswer)
      : scoreMcqOrScenario(question, input.selectedIndex);

  if (question.type === "short-answer" && input.textAnswer?.trim()) {
    const ai = await evaluateShortAnswer(
      session.roleSlug as RoleSlug,
      question,
      input.textAnswer,
    );
    if (ai) scoreRecord = applyAiScore(scoreRecord, ai);
  }

  await prisma.questionResponse.upsert({
    where: {
      sessionId_questionBankId: { sessionId, questionBankId: input.questionId },
    },
    create: {
      sessionId,
      questionBankId: input.questionId,
      questionType: question.type,
      skillTag: question.skill_tag,
      selectedIndex: input.selectedIndex ?? null,
      textAnswer: input.textAnswer ?? null,
      score: scoreRecord.score,
      maxScore: scoreRecord.maxScore,
      aiEvaluation: scoreRecord.aiEvaluation ? (scoreRecord.aiEvaluation as object) : undefined,
    },
    update: {
      selectedIndex: input.selectedIndex ?? null,
      textAnswer: input.textAnswer ?? null,
      score: scoreRecord.score,
      maxScore: scoreRecord.maxScore,
      aiEvaluation: scoreRecord.aiEvaluation ? (scoreRecord.aiEvaluation as object) : undefined,
    },
  });

  if (input.currentIndex !== undefined) {
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: { currentIndex: input.currentIndex },
    });
  }

  return getMvpSession(userId, sessionId);
}

export async function completeMvpSession(userId: string, sessionId: string) {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: { responses: true },
  });

  if (!session || session.userId !== userId) {
    throw new MvpAssessmentError("Session not found", 404);
  }
  if (session.status === MvpSessionStatus.COMPLETED) {
    return getMvpResult(userId, sessionId);
  }

  const responseRecords = session.responses.map((r) => ({
    questionId: r.questionBankId,
    questionType: r.questionType as BankQuestion["type"],
    skillTag: r.skillTag,
    selectedIndex: r.selectedIndex,
    textAnswer: r.textAnswer,
    score: r.score,
    maxScore: r.maxScore,
    aiEvaluation: r.aiEvaluation as never,
  }));

  const result = buildAssessmentResult({
    sessionId,
    role: session.roleSlug as RoleSlug,
    difficulty: session.difficulty as Difficulty,
    responses: responseRecords,
  });

  const aiFeedback =
    (await generateSessionFeedback(
      session.roleSlug as RoleSlug,
      result.overallScore,
      result.weakAreas,
    )) ?? result.aiFeedback;

  const finalResult = { ...result, aiFeedback };

  await prisma.$transaction(async (tx) => {
    await tx.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: MvpSessionStatus.COMPLETED,
        completedAt: new Date(),
        overallScore: finalResult.overallScore,
        readinessLevel: finalResult.readinessLevel,
        passed: finalResult.passed,
        skillBreakdown: finalResult.skillBreakdown as never,
        weakAreas: finalResult.weakAreas as never,
        recommendations: {
          topics: finalResult.recommendedTopics,
          resources: finalResult.recommendedResources,
          roadmap: finalResult.roadmapRecommendations,
        } as never,
        aiFeedback: finalResult.aiFeedback,
      },
    });

    await tx.skillScore.deleteMany({ where: { sessionId } });
    for (const skill of result.skillBreakdown) {
      await tx.skillScore.create({
        data: {
          sessionId,
          skillTag: skill.skillTag,
          score: skill.score,
          maxScore: skill.maxScore,
          percent: skill.percent,
        },
      });
    }

    await tx.userAssessmentHistory.upsert({
      where: { sessionId },
      create: {
        userId,
        roleSlug: session.roleSlug,
        sessionId,
        difficulty: session.difficulty,
        overallScore: finalResult.overallScore,
        readinessLevel: finalResult.readinessLevel,
        passed: finalResult.passed,
        completedAt: new Date(),
      },
      update: {
        overallScore: finalResult.overallScore,
        readinessLevel: finalResult.readinessLevel,
        passed: finalResult.passed,
        completedAt: new Date(),
      },
    });
  });

  return getMvpResult(userId, sessionId);
}

export async function getMvpResult(userId: string, sessionId: string) {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: { skillScores: true },
  });

  if (!session || session.userId !== userId) {
    throw new MvpAssessmentError("Result not found", 404);
  }

  if (session.status !== MvpSessionStatus.COMPLETED) {
    throw new MvpAssessmentError("Assessment not completed yet", 400, "NOT_COMPLETED");
  }

  const recs = session.recommendations as {
    topics?: string[];
    resources?: unknown[];
    roadmap?: unknown[];
  } | null;

  return {
    result: {
      sessionId: session.id,
      role: session.roleSlug,
      roleName: ROLE_LABELS[session.roleSlug as RoleSlug],
      difficulty: session.difficulty,
      overallScore: session.overallScore ?? 0,
      readinessLevel: session.readinessLevel ?? "beginner",
      passed: session.passed ?? false,
      skillBreakdown: session.skillBreakdown ?? [],
      weakAreas: session.weakAreas ?? [],
      recommendedTopics: recs?.topics ?? [],
      recommendedResources: recs?.resources ?? [],
      roadmapRecommendations: recs?.roadmap ?? [],
      aiFeedback: session.aiFeedback,
      completedAt: session.completedAt?.toISOString(),
    },
  };
}

export async function getMvpHistory(userId: string, roleSlug?: RoleSlug) {
  const rows = await prisma.userAssessmentHistory.findMany({
    where: { userId, ...(roleSlug ? { roleSlug } : {}) },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  return {
    history: rows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      roleSlug: r.roleSlug,
      roleName: ROLE_LABELS[r.roleSlug as RoleSlug],
      difficulty: r.difficulty,
      overallScore: r.overallScore,
      readinessLevel: r.readinessLevel,
      passed: r.passed,
      completedAt: r.completedAt.toISOString(),
    })),
  };
}
