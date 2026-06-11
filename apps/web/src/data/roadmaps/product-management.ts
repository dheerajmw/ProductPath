import type { Roadmap } from "./types/roadmap";
import { sharedAiInterviewTopics, sharedAiResources, sharedAiTools } from "./shared/ai-base";

export const aiProductManagementRoadmap: Roadmap = {
  meta: {
    slug: "ai-product-management",
    title: "AI Product Management",
    description:
      "Build the skills to ship responsible AI features — from discovery and PRDs to evals, launch, and iteration.",
    targetRoles: [
      "AI Product Manager",
      "Senior PM (AI)",
      "Technical Product Manager",
      "Platform PM (ML)",
    ],
    difficulty: "intermediate",
    estimatedDuration: "6–9 months",
    aiFocusLevel: "advanced",
    salaryRange: { min: 130000, max: 220000, currency: "USD", region: "US remote/hybrid" },
    jobDemandScore: 9,
    tags: ["LLM", "evals", "roadmapping", "AI strategy"],
  },
  phases: [
    {
      id: "foundation",
      title: "AI PM foundations",
      description: "LLM basics, product sense for AI, and responsible AI principles.",
      duration: "4–6 weeks",
      order: 1,
    },
    {
      id: "discovery",
      title: "Discovery & problem framing",
      description: "Jobs-to-be-done, AI feasibility, and build vs. buy decisions.",
      duration: "3–4 weeks",
      order: 2,
    },
    {
      id: "delivery",
      title: "Delivery & evaluation",
      description: "PRDs for AI, eval harnesses, beta programs, and launch criteria.",
      duration: "6–8 weeks",
      order: 3,
    },
    {
      id: "scale",
      title: "Scale & portfolio",
      description: "Cost/latency tradeoffs, platform thinking, and AI roadmap governance.",
      duration: "4–6 weeks",
      order: 4,
    },
  ],
  skills: [
    { name: "LLM product sense", category: "Core", level: "intermediate", phaseId: "foundation" },
    { name: "Prompt & context design", category: "Core", level: "intermediate", phaseId: "foundation" },
    { name: "AI risk & safety framing", category: "Responsible AI", level: "intermediate", phaseId: "foundation" },
    { name: "Eval design (golden sets)", category: "Quality", level: "advanced", phaseId: "delivery" },
    { name: "Experimentation & A/B for AI", category: "Growth", level: "intermediate", phaseId: "delivery" },
    { name: "Unit economics (token cost)", category: "Strategy", level: "advanced", phaseId: "scale" },
    { name: "Stakeholder alignment", category: "Leadership", level: "intermediate" },
    { name: "Technical collaboration", category: "Execution", level: "intermediate" },
  ],
  tools: [
    ...sharedAiTools,
    { name: "Notion / Linear", category: "Product ops", description: "Specs, roadmaps, and launch checklists." },
    { name: "Amplitude / Mixpanel", category: "Analytics", description: "Funnel and retention for AI features." },
    { name: "Humanloop / PromptLayer", category: "Prompt ops", description: "Versioning and eval workflows." },
  ],
  projects: [
    {
      title: "AI feature PRD with eval plan",
      description: "Write a v1 spec for a copilot feature including success metrics and eval criteria.",
      outcomes: ["PRD with guardrails", "Golden question set", "Launch rollback plan"],
      difficulty: "intermediate",
    },
    {
      title: "Build vs. buy decision memo",
      description: "Compare foundation model API vs. fine-tuned open model for a use case.",
      outcomes: ["Cost model", "Latency budget", "Risk register"],
      difficulty: "advanced",
    },
    {
      title: "Post-launch iteration case study",
      description: "Analyze eval failures from a beta and propose v1.1 scope.",
      outcomes: ["Prioritized backlog", "Quality dashboard mock", "User trust narrative"],
      difficulty: "intermediate",
    },
  ],
  interviewPrep: [
    ...sharedAiInterviewTopics,
    {
      topic: "AI roadmap prioritization",
      tips: ["Use impact × feasibility × risk", "Show how you'd sequence platform vs. feature work"],
      sampleQuestions: ["How would you prioritize three AI bets with one eng squad?"],
    },
  ],
  timelines: [
    { phaseId: "foundation", label: "Foundations", weeks: 5 },
    { phaseId: "discovery", label: "Discovery", weeks: 4 },
    { phaseId: "delivery", label: "Delivery", weeks: 7 },
    { phaseId: "scale", label: "Scale", weeks: 5 },
  ],
  salaryPotential: {
    entry: "$130k–$155k",
    mid: "$155k–$185k",
    senior: "$185k–$220k+",
    notes: "Equity and AI premium vary by stage; staff/principal tracks higher.",
  },
  resources: [
    ...sharedAiResources,
    { title: "OpenAI / Anthropic product docs", type: "article", description: "Model limits and safety guides." },
    { title: "Lenny's Newsletter — AI PM episodes", type: "video" },
  ],
  milestones: [
    { title: "Complete AI foundations module", description: "Pass self-assessment on LLM basics.", phaseId: "foundation", week: 4 },
    { title: "Ship proof-of-work PRD", description: "Publish AI feature spec in ProductPath.", phaseId: "delivery", week: 14 },
    { title: "Mock staff PM loop", description: "Run panel with AI sense + execution stories.", week: 20 },
  ],
  learningPath: [
    { step: 1, title: "Learn LLM constraints", description: "Context windows, latency, cost, hallucinations.", duration: "2 weeks" },
    { step: 2, title: "Practice AI discovery", description: "Interview users; map jobs AI can/can't solve.", duration: "2 weeks" },
    { step: 3, title: "Write eval-first PRDs", description: "Pair specs with measurable quality bars.", duration: "3 weeks" },
    { step: 4, title: "Build portfolio projects", description: "Submit 2–3 AI PM artifacts on ProductPath.", duration: "4 weeks" },
    { step: 5, title: "Interview prep sprint", description: "Product sense, metrics, and AI tradeoff stories.", duration: "2 weeks" },
  ],
};
