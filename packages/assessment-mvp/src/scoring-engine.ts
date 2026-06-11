import type {
  AiEvaluationResult,
  AssessmentResultPayload,
  BankQuestion,
  Difficulty,
  LearningResource,
  QuestionResponseRecord,
  ReadinessLevel,
  RoadmapRecommendation,
  RoleSlug,
  SkillBreakdown,
} from "../../../types/assessment";
import { getReadinessLevel, getBenchmark } from "../../../data/benchmarks/index.js";
import { getResourcesForRole } from "../../../data/resources/index.js";
import { getSkillBySlug } from "../../../data/skills/index.js";

const MAX_SCORE = 100;

export function scoreMcqOrScenario(
  question: BankQuestion,
  selectedIndex?: number | null,
): QuestionResponseRecord {
  const correct = typeof question.answer === "number" && selectedIndex === question.answer;
  return {
    questionId: question.id,
    questionType: question.type,
    skillTag: question.skill_tag,
    selectedIndex: selectedIndex ?? null,
    score: correct ? MAX_SCORE : 0,
    maxScore: MAX_SCORE,
    correct,
  };
}

/** Rule-based short answer scoring when OpenAI is unavailable. */
export function scoreShortAnswerRuleBased(
  question: BankQuestion,
  textAnswer?: string | null,
): QuestionResponseRecord {
  const answer = textAnswer?.trim().toLowerCase() ?? "";
  const keywords = String(question.answer)
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (!answer) {
    return {
      questionId: question.id,
      questionType: question.type,
      skillTag: question.skill_tag,
      textAnswer: textAnswer ?? null,
      score: 0,
      maxScore: MAX_SCORE,
      correct: false,
    };
  }

  const matched = keywords.filter((kw) => answer.includes(kw)).length;
  const ratio = keywords.length > 0 ? matched / keywords.length : 0;
  const score = Math.round(Math.min(1, ratio + (answer.length > 40 ? 0.15 : 0)) * MAX_SCORE);

  return {
    questionId: question.id,
    questionType: question.type,
    skillTag: question.skill_tag,
    textAnswer: textAnswer ?? null,
    score,
    maxScore: MAX_SCORE,
    correct: score >= 60,
  };
}

export function applyAiScore(
  base: QuestionResponseRecord,
  ai: AiEvaluationResult,
): QuestionResponseRecord {
  return {
    ...base,
    score: ai.score,
    correct: ai.score >= 60,
    aiEvaluation: ai,
  };
}

export function aggregateSkillBreakdown(
  role: RoleSlug,
  responses: QuestionResponseRecord[],
): SkillBreakdown[] {
  const bySkill = new Map<string, { score: number; max: number }>();

  for (const r of responses) {
    const entry = bySkill.get(r.skillTag) ?? { score: 0, max: 0 };
    entry.score += r.score;
    entry.max += r.maxScore;
    bySkill.set(r.skillTag, entry);
  }

  const floor = getBenchmark(role).passSkillFloor;

  return Array.from(bySkill.entries()).map(([skillTag, v]) => {
    const percent = v.max > 0 ? Math.round((v.score / v.max) * 100) : 0;
    const skill = getSkillBySlug(role, skillTag);
    return {
      skillTag,
      skillName: skill?.name ?? skillTag,
      score: v.score,
      maxScore: v.max,
      percent,
      weak: percent < floor,
    };
  });
}

export function detectWeakAreas(breakdown: SkillBreakdown[]): string[] {
  return breakdown.filter((s) => s.weak).map((s) => s.skillName);
}

export function computeOverallScore(breakdown: SkillBreakdown[]): number {
  if (breakdown.length === 0) return 0;
  const total = breakdown.reduce((sum, s) => sum + s.percent, 0);
  return Math.round(total / breakdown.length);
}

export function recommendResources(
  role: RoleSlug,
  weakSkillTags: string[],
  limit = 5,
): LearningResource[] {
  const all = getResourcesForRole(role);
  const weakSet = new Set(weakSkillTags);
  const matched = all.filter((r) => weakSet.has(r.topic) || weakSkillTags.some((t) => r.topic.includes(t)));
  return (matched.length > 0 ? matched : all).slice(0, limit);
}

export function buildRoadmapRecommendations(
  role: RoleSlug,
  breakdown: SkillBreakdown[],
): RoadmapRecommendation[] {
  return breakdown
    .filter((s) => s.weak)
    .slice(0, 4)
    .map((s, i) => {
      const skill = getSkillBySlug(role, s.skillTag);
      return {
        topic: skill?.related_topics[0] ?? s.skillName,
        reason: `Score ${s.percent}% on ${s.skillName} — focus here next.`,
        priority: i === 0 ? "high" : i < 3 ? "medium" : "low",
      } satisfies RoadmapRecommendation;
    });
}

export function buildAssessmentResult(params: {
  sessionId: string;
  role: RoleSlug;
  difficulty: Difficulty;
  responses: QuestionResponseRecord[];
  aiFeedback?: string;
  completedAt?: Date;
}): AssessmentResultPayload {
  const breakdown = aggregateSkillBreakdown(params.role, params.responses);
  const overallScore = computeOverallScore(breakdown);
  const readinessLevel: ReadinessLevel = getReadinessLevel(params.role, overallScore);
  const weakSkillTags = breakdown.filter((s) => s.weak).map((s) => s.skillTag);
  const benchmark = getBenchmark(params.role);
  const minSkill = breakdown.length ? Math.min(...breakdown.map((s) => s.percent)) : 0;
  const passed =
    overallScore >= benchmark.thresholds["apm-ready"] && minSkill >= benchmark.passSkillFloor;

  return {
    sessionId: params.sessionId,
    role: params.role,
    difficulty: params.difficulty,
    overallScore,
    readinessLevel,
    passed,
    skillBreakdown: breakdown,
    weakAreas: detectWeakAreas(breakdown),
    recommendedTopics: weakSkillTags,
    recommendedResources: recommendResources(params.role, weakSkillTags),
    roadmapRecommendations: buildRoadmapRecommendations(params.role, breakdown),
    aiFeedback: params.aiFeedback,
    completedAt: (params.completedAt ?? new Date()).toISOString(),
  };
}
