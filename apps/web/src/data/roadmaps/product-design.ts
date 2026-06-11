import type { Roadmap } from "./types/roadmap";
import { sharedAiInterviewTopics, sharedAiResources, sharedAiTools } from "./shared/ai-base";

export const aiProductDesignRoadmap: Roadmap = {
  meta: {
    slug: "ai-product-design",
    title: "AI Product Design",
    description:
      "Design trustworthy AI experiences — conversational UX, agent flows, prototyping with LLMs, and design systems for uncertainty.",
    targetRoles: [
      "AI Product Designer",
      "Senior Product Designer (AI)",
      "Design Lead — Generative UX",
      "Conversation Designer",
    ],
    difficulty: "intermediate",
    estimatedDuration: "5–8 months",
    aiFocusLevel: "advanced",
    salaryRange: { min: 115000, max: 195000, currency: "USD", region: "US remote/hybrid" },
    jobDemandScore: 8,
    tags: ["UX", "conversation design", "prototyping", "design systems"],
  },
  phases: [
    {
      id: "foundation",
      title: "AI UX foundations",
      description: "Patterns for copilots, agents, uncertainty, and consent.",
      duration: "4 weeks",
      order: 1,
    },
    {
      id: "research",
      title: "Research & synthesis",
      description: "AI-assisted research ops with human validation.",
      duration: "3–4 weeks",
      order: 2,
    },
    {
      id: "craft",
      title: "Interaction craft",
      description: "Flows, states, empty/error/loading for non-deterministic UI.",
      duration: "6 weeks",
      order: 3,
    },
    {
      id: "systems",
      title: "Systems & handoff",
      description: "Design tokens for AI components and eng collaboration.",
      duration: "4 weeks",
      order: 4,
    },
  ],
  skills: [
    { name: "Conversational UX", category: "Core", level: "intermediate", phaseId: "foundation" },
    { name: "Uncertainty & confidence UI", category: "Core", level: "advanced", phaseId: "foundation" },
    { name: "AI-assisted research", category: "Research", level: "intermediate", phaseId: "research" },
    { name: "Rapid LLM prototyping", category: "Craft", level: "intermediate", phaseId: "craft" },
    { name: "Accessibility for AI", category: "Quality", level: "advanced" },
    { name: "Design critique for AI", category: "Leadership", level: "intermediate" },
    { name: "Figma + code parity", category: "Systems", level: "intermediate", phaseId: "systems" },
  ],
  tools: [
    ...sharedAiTools,
    { name: "Figma", category: "Design", description: "Flows, components, and design specs." },
    { name: "Framer / v0", category: "Prototyping", description: "High-fidelity AI UI prototypes." },
    { name: "Maze / Usertesting", category: "Research", description: "Validate AI UX with real users." },
  ],
  projects: [
    {
      title: "Copilot UX case study",
      description: "End-to-end flow for an embedded assistant with citation UI.",
      outcomes: ["User flow", "Component specs", "Usability test summary"],
      difficulty: "intermediate",
    },
    {
      title: "Error & recovery patterns library",
      description: "Catalog states for model failure, timeout, and policy blocks.",
      outcomes: ["Pattern library", "Content guidelines", "Eng handoff"],
      difficulty: "intermediate",
    },
    {
      title: "Agent onboarding redesign",
      description: "First-run experience that sets expectations for AI behavior.",
      outcomes: ["Prototype", "Metrics plan", "Before/after critique"],
      difficulty: "advanced",
    },
  ],
  interviewPrep: [
    ...sharedAiInterviewTopics,
    {
      topic: "Portfolio presentation",
      tips: ["Show process under uncertainty", "Explain tradeoffs vs. deterministic UI"],
      sampleQuestions: ["Walk us through an AI feature you would not ship — why?"],
    },
  ],
  timelines: [
    { phaseId: "foundation", label: "Foundations", weeks: 4 },
    { phaseId: "research", label: "Research", weeks: 4 },
    { phaseId: "craft", label: "Craft", weeks: 6 },
    { phaseId: "systems", label: "Systems", weeks: 4 },
  ],
  salaryPotential: {
    entry: "$115k–$140k",
    mid: "$140k–$170k",
    senior: "$170k–$195k+",
    notes: "Staff design and AI-specialist roles command premium at growth-stage companies.",
  },
  resources: [
    ...sharedAiResources,
    { title: "Shape of AI — UX patterns", type: "article" },
    { title: "Google PAIR Guidebook", type: "book" },
  ],
  milestones: [
    { title: "Pattern library v1", description: "Document 8+ AI UX patterns with examples.", phaseId: "foundation", week: 4 },
    { title: "Published case study", description: "Ship portfolio piece on ProductPath.", phaseId: "craft", week: 12 },
    { title: "Design critique panel", description: "Present AI UX decisions to peers.", week: 18 },
  ],
  learningPath: [
    { step: 1, title: "Study AI UX patterns", description: "Copilots, agents, citations, human-in-the-loop.", duration: "2 weeks" },
    { step: 2, title: "Run research sprint", description: "Validate assumptions with 5+ user sessions.", duration: "2 weeks" },
    { step: 3, title: "Prototype in Figma + LLM", description: "Pair static UI with working prompt demos.", duration: "3 weeks" },
    { step: 4, title: "Build portfolio", description: "Two case studies with measurable outcomes.", duration: "4 weeks" },
    { step: 5, title: "Interview loop prep", description: "Whiteboard AI flows and critique exercises.", duration: "2 weeks" },
  ],
};
