/** MVP assessment types — shared across data, API, and web. */

export type RoleSlug =
  | "product-management"
  | "product-design"
  | "product-marketing"
  | "product-analytics"
  | "product-operations";

export type Difficulty = "beginner" | "intermediate";

export type QuestionType = "mcq" | "scenario" | "short-answer";

export type ReadinessLevel = "beginner" | "internship-ready" | "apm-ready" | "intermediate";

export type ResourceType = "article" | "video" | "course" | "tool" | "blog";

export interface BankQuestion {
  id: string;
  role: RoleSlug;
  difficulty: Difficulty;
  question: string;
  type: QuestionType;
  options?: string[];
  answer: string | number;
  explanation: string;
  skill_tag: string;
  estimated_time: number;
  /** Optional context for scenario questions */
  context?: string;
}

export interface LearningResource {
  title: string;
  topic: string;
  type: ResourceType;
  url: string;
  difficulty: Difficulty;
  estimated_time: number;
}

export interface SkillDefinition {
  slug: string;
  name: string;
  role: RoleSlug;
  category: string;
  related_topics: string[];
  roadmap_sections: string[];
}

export interface ReadinessThresholds {
  beginner: number;
  "internship-ready": number;
  "apm-ready": number;
  intermediate: number;
}

export interface RoleBenchmark {
  role: RoleSlug;
  thresholds: ReadinessThresholds;
  passSkillFloor: number;
}

export interface AssessmentConfig {
  role: RoleSlug;
  difficulty: Difficulty;
  title: string;
  description: string;
  durationMinutes: number;
  questionCount: number;
}

export interface QuestionResponseInput {
  questionId: string;
  selectedIndex?: number;
  textAnswer?: string;
}

export interface QuestionResponseRecord {
  questionId: string;
  questionType: QuestionType;
  skillTag: string;
  selectedIndex?: number | null;
  textAnswer?: string | null;
  score: number;
  maxScore: number;
  correct?: boolean;
  aiEvaluation?: AiEvaluationResult | null;
}

export interface AiEvaluationResult {
  score: number;
  reasoning_quality: number;
  clarity: number;
  role_thinking: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface SkillBreakdown {
  skillTag: string;
  skillName: string;
  score: number;
  maxScore: number;
  percent: number;
  weak: boolean;
}

export interface RoadmapRecommendation {
  topic: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface AssessmentResultPayload {
  sessionId: string;
  role: RoleSlug;
  difficulty: Difficulty;
  overallScore: number;
  readinessLevel: ReadinessLevel;
  passed: boolean;
  skillBreakdown: SkillBreakdown[];
  weakAreas: string[];
  recommendedTopics: string[];
  recommendedResources: LearningResource[];
  roadmapRecommendations: RoadmapRecommendation[];
  aiFeedback?: string;
  completedAt: string;
}

export interface AssessmentSessionState {
  id: string;
  role: RoleSlug;
  difficulty: Difficulty;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  currentIndex: number;
  totalQuestions: number;
  startedAt: string;
  expiresAt?: string;
}

export interface AssessmentQuestionView {
  id: string;
  index: number;
  type: QuestionType;
  question: string;
  context?: string;
  options?: string[];
  skillTag: string;
  estimatedTime: number;
  answered: boolean;
}

export const ROLE_SLUGS: RoleSlug[] = [
  "product-management",
  "product-design",
  "product-marketing",
  "product-analytics",
  "product-operations",
];

export const ROLE_LABELS: Record<RoleSlug, string> = {
  "product-management": "Product Management",
  "product-design": "Product Design",
  "product-marketing": "Product Marketing",
  "product-analytics": "Product Analytics",
  "product-operations": "Product Operations",
};
