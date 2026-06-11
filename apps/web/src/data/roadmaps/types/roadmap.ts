/** Difficulty band for roadmap content and skills. */
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

/** How deeply the roadmap focuses on AI-native workflows. */
export type AiFocusLevel = "foundational" | "applied" | "advanced" | "expert";

export type ResourceType = "course" | "book" | "article" | "video" | "tool" | "community";

/** Core metadata — maps cleanly to CMS/DB columns later. */
export interface RoadmapMetadata {
  slug: string;
  title: string;
  description: string;
  targetRoles: string[];
  difficulty: DifficultyLevel;
  estimatedDuration: string;
  aiFocusLevel: AiFocusLevel;
  salaryRange: {
    min: number;
    max: number;
    currency: "USD";
    region: string;
  };
  /** 1–10 demand signal for hiring market (static editorial score). */
  jobDemandScore: number;
  tags?: string[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
}

export interface RoadmapSkill {
  name: string;
  category: string;
  level: DifficultyLevel;
  phaseId?: string;
}

export interface RoadmapTool {
  name: string;
  category: string;
  description?: string;
}

export interface RoadmapProject {
  title: string;
  description: string;
  outcomes: string[];
  difficulty: DifficultyLevel;
}

export interface InterviewPrepItem {
  topic: string;
  tips: string[];
  sampleQuestions?: string[];
}

export interface RoadmapTimelineEntry {
  phaseId: string;
  label: string;
  weeks: number;
}

export interface SalaryPotential {
  entry: string;
  mid: string;
  senior: string;
  notes?: string;
}

export interface RoadmapResource {
  title: string;
  type: ResourceType;
  url?: string;
  description?: string;
}

export interface RoadmapMilestone {
  title: string;
  description: string;
  phaseId?: string;
  week?: number;
}

export interface CareerOutcome {
  title: string;
  description: string;
  metric?: string;
}

export interface LearningPathStep {
  step: number;
  title: string;
  description: string;
  duration?: string;
}

/** Full roadmap document — future CMS/DB shape. */
export interface Roadmap {
  meta: RoadmapMetadata;
  phases: RoadmapPhase[];
  skills: RoadmapSkill[];
  tools: RoadmapTool[];
  projects: RoadmapProject[];
  interviewPrep: InterviewPrepItem[];
  timelines: RoadmapTimelineEntry[];
  salaryPotential: SalaryPotential;
  resources: RoadmapResource[];
  milestones: RoadmapMilestone[];
  learningPath: LearningPathStep[];
}

/** Lightweight card shape for catalog listings. */
export type RoadmapSummary = Pick<
  RoadmapMetadata,
  | "slug"
  | "title"
  | "description"
  | "targetRoles"
  | "difficulty"
  | "estimatedDuration"
  | "aiFocusLevel"
  | "salaryRange"
  | "jobDemandScore"
  | "tags"
>;
