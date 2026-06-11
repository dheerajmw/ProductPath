import type {
  InterviewPrepItem,
  RoadmapResource,
  RoadmapTool,
} from "../types/roadmap";

/** Shared AI literacy resources reused across career roadmaps. */
export const sharedAiResources: RoadmapResource[] = [
  {
    title: "AI for Product Teams (Foundations)",
    type: "course",
    description: "Prompting, evaluation, and responsible AI basics for product roles.",
  },
  {
    title: "Building LLM Applications",
    type: "book",
    description: "Architecture patterns for retrieval, agents, and guardrails.",
  },
  {
    title: "ProductPath AI Project Gallery",
    type: "community",
    description: "Proof-of-work submissions that demonstrate AI product judgment.",
  },
];

export const sharedAiTools: RoadmapTool[] = [
  {
    name: "ChatGPT / Claude",
    category: "LLM assistants",
    description: "Drafting, critique, and synthetic user research.",
  },
  {
    name: "Cursor / GitHub Copilot",
    category: "AI coding",
    description: "Prototyping and technical collaboration with engineers.",
  },
  {
    name: "Langfuse / Weights & Biases",
    category: "Observability",
    description: "Trace quality, latency, and cost for AI features.",
  },
];

export const sharedAiInterviewTopics: InterviewPrepItem[] = [
  {
    topic: "AI product sense",
    tips: [
      "Frame problems as user jobs, not model capabilities.",
      "Explain when not to use AI (cost, latency, risk).",
      "Describe evaluation beyond accuracy (trust, UX, compliance).",
    ],
    sampleQuestions: [
      "Design an AI feature for our core workflow — what would you ship in v1?",
      "How would you detect and handle hallucinations in production?",
    ],
  },
];
