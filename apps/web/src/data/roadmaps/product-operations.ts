import type { Roadmap } from "./types/roadmap";
import { sharedAiInterviewTopics, sharedAiResources, sharedAiTools } from "./shared/ai-base";

export const aiProductOperationsRoadmap: Roadmap = {
  meta: {
    slug: "ai-product-operations",
    title: "AI Product Operations",
    description:
      "Operationalize AI delivery — rituals, tooling, compliance workflows, and cross-functional cadences for AI product teams.",
    targetRoles: [
      "AI Product Ops Manager",
      "Technical Program Manager (AI)",
      "Product Operations Lead",
      "Chief of Staff — Product (AI)",
    ],
    difficulty: "intermediate",
    estimatedDuration: "5–7 months",
    aiFocusLevel: "applied",
    salaryRange: { min: 110000, max: 185000, currency: "USD", region: "US remote/hybrid" },
    jobDemandScore: 7,
    tags: ["product ops", "TPM", "process", "governance"],
  },
  phases: [
    {
      id: "foundation",
      title: "Product ops foundations",
      description: "Operating models, rituals, and tooling stack for product teams.",
      duration: "4 weeks",
      order: 1,
    },
    {
      id: "ai-delivery",
      title: "AI delivery ops",
      description: "Eval gates, release checklists, and incident playbooks for AI.",
      duration: "5 weeks",
      order: 2,
    },
    {
      id: "governance",
      title: "Governance & compliance",
      description: "Review workflows, documentation, and audit readiness.",
      duration: "4 weeks",
      order: 3,
    },
    {
      id: "scale",
      title: "Scale & efficiency",
      description: "Capacity planning, vendor management, and org design support.",
      duration: "4 weeks",
      order: 4,
    },
  ],
  skills: [
    { name: "Product operating cadence", category: "Core", level: "intermediate", phaseId: "foundation" },
    { name: "Roadmap instrumentation", category: "Planning", level: "intermediate", phaseId: "foundation" },
    { name: "AI release management", category: "Delivery", level: "advanced", phaseId: "ai-delivery" },
    { name: "Eval & quality gates", category: "Quality", level: "advanced", phaseId: "ai-delivery" },
    { name: "Risk & compliance workflows", category: "Governance", level: "intermediate", phaseId: "governance" },
    { name: "Vendor & model governance", category: "Strategy", level: "intermediate", phaseId: "scale" },
    { name: "Executive reporting", category: "Communication", level: "intermediate" },
  ],
  tools: [
    ...sharedAiTools,
    { name: "Linear / Jira", category: "Delivery", description: "Sprint and launch tracking." },
    { name: "Notion / Confluence", category: "Knowledge", description: "Playbooks and decision logs." },
    { name: "LaunchDarkly", category: "Release", description: "Controlled rollouts for AI features." },
  ],
  projects: [
    {
      title: "AI launch playbook",
      description: "End-to-end checklist from eval sign-off to rollback.",
      outcomes: ["Playbook doc", "RACI", "Incident runbook"],
      difficulty: "intermediate",
    },
    {
      title: "Product ops dashboard",
      description: "Single view of roadmap health, quality, and cost KPIs.",
      outcomes: ["Metric definitions", "Dashboard spec", "Review cadence"],
      difficulty: "intermediate",
    },
    {
      title: "Governance workflow design",
      description: "Human review pipeline for high-risk AI outputs.",
      outcomes: ["Process map", "SLA targets", "Tooling recommendation"],
      difficulty: "advanced",
    },
  ],
  interviewPrep: [
    ...sharedAiInterviewTopics,
    {
      topic: "Ops scenario interviews",
      tips: ["Show systems thinking", "Balance speed vs. safety with concrete rituals"],
      sampleQuestions: ["How would you operationalize eval gates without slowing teams?"],
    },
  ],
  timelines: [
    { phaseId: "foundation", label: "Foundations", weeks: 4 },
    { phaseId: "ai-delivery", label: "AI delivery", weeks: 5 },
    { phaseId: "governance", label: "Governance", weeks: 4 },
    { phaseId: "scale", label: "Scale", weeks: 4 },
  ],
  salaryPotential: {
    entry: "$110k–$135k",
    mid: "$135k–$160k",
    senior: "$160k–$185k+",
    notes: "TPM and product ops tracks converge at senior levels in AI platform teams.",
  },
  resources: [
    ...sharedAiResources,
    { title: "Product Ops — Melissa Perri", type: "book" },
    { title: "NIST AI RMF overview", type: "article" },
  ],
  milestones: [
    { title: "Ops audit", description: "Assess current rituals and gaps for AI delivery.", phaseId: "foundation", week: 4 },
    { title: "Playbook v1 shipped", description: "Publish AI launch playbook artifact.", phaseId: "ai-delivery", week: 9 },
    { title: "Ops case presentation", description: "Present governance workflow to mock leadership.", week: 15 },
  ],
  learningPath: [
    { step: 1, title: "Map the operating model", description: "Cadences, artifacts, and stakeholders.", duration: "2 weeks" },
    { step: 2, title: "Design AI release gates", description: "Eval criteria, checklists, rollback.", duration: "3 weeks" },
    { step: 3, title: "Build governance flows", description: "Review paths for risky AI outputs.", duration: "2 weeks" },
    { step: 4, title: "Portfolio artifacts", description: "Playbook + dashboard spec on ProductPath.", duration: "3 weeks" },
    { step: 5, title: "Interview prep", description: "Ops scenarios and cross-functional stories.", duration: "2 weeks" },
  ],
};
