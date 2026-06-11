import type { Roadmap } from "./types/roadmap";
import { sharedAiInterviewTopics, sharedAiResources, sharedAiTools } from "./shared/ai-base";

export const aiProductAnalyticsRoadmap: Roadmap = {
  meta: {
    slug: "ai-product-analytics",
    title: "AI Product Analytics",
    description:
      "Measure AI products with rigor — eval metrics, experimentation, data quality, and executive dashboards for LLM features.",
    targetRoles: [
      "AI Product Analyst",
      "Product Data Scientist",
      "Analytics PM",
      "Growth Analyst (AI)",
    ],
    difficulty: "intermediate",
    estimatedDuration: "6–8 months",
    aiFocusLevel: "applied",
    salaryRange: { min: 105000, max: 180000, currency: "USD", region: "US remote/hybrid" },
    jobDemandScore: 8,
    tags: ["metrics", "SQL", "experimentation", "evals"],
  },
  phases: [
    {
      id: "foundation",
      title: "Analytics foundations",
      description: "SQL, event taxonomy, and AI-specific metric frameworks.",
      duration: "5 weeks",
      order: 1,
    },
    {
      id: "measurement",
      title: "AI measurement",
      description: "Quality, cost, latency, and human-feedback loops.",
      duration: "5 weeks",
      order: 2,
    },
    {
      id: "experimentation",
      title: "Experimentation",
      description: "A/B tests, quasi-experiments, and guardrail metrics for AI.",
      duration: "4 weeks",
      order: 3,
    },
    {
      id: "insights",
      title: "Insights & storytelling",
      description: "Executive narratives, dashboards, and decision support.",
      duration: "4 weeks",
      order: 4,
    },
  ],
  skills: [
    { name: "SQL & dbt", category: "Core", level: "intermediate", phaseId: "foundation" },
    { name: "Event instrumentation", category: "Core", level: "intermediate", phaseId: "foundation" },
    { name: "LLM eval metrics", category: "AI quality", level: "advanced", phaseId: "measurement" },
    { name: "Cost & token analytics", category: "FinOps", level: "intermediate", phaseId: "measurement" },
    { name: "Experiment design", category: "Growth", level: "intermediate", phaseId: "experimentation" },
    { name: "Causal inference basics", category: "Statistics", level: "advanced" },
    { name: "Data visualization", category: "Communication", level: "intermediate", phaseId: "insights" },
  ],
  tools: [
    ...sharedAiTools,
    { name: "BigQuery / Snowflake", category: "Warehouse", description: "Large-scale product analytics." },
    { name: "dbt", category: "Transform", description: "Metric layers and documentation." },
    { name: "Looker / Metabase", category: "BI", description: "Dashboards for AI feature health." },
    { name: "Statsig / Optimizely", category: "Experimentation", description: "Feature flags and A/B tests." },
  ],
  projects: [
    {
      title: "AI feature metrics framework",
      description: "Define north-star, guardrails, and eval KPIs for a copilot.",
      outcomes: ["Metric dictionary", "Dashboard wireframe", "Stakeholder review"],
      difficulty: "intermediate",
    },
    {
      title: "Experiment readout",
      description: "Analyze prompt change with quality + business impact.",
      outcomes: ["SQL notebook", "Decision memo", "Follow-up test plan"],
      difficulty: "advanced",
    },
    {
      title: "Cost optimization analysis",
      description: "Model token spend vs. engagement by cohort.",
      outcomes: ["Savings scenarios", "Product recommendations"],
      difficulty: "intermediate",
    },
  ],
  interviewPrep: [
    ...sharedAiInterviewTopics,
    {
      topic: "Metrics case studies",
      tips: ["Structure: goal → metrics → analysis → recommendation", "Call out data quality risks"],
      sampleQuestions: ["How would you measure success for an AI search feature?"],
    },
  ],
  timelines: [
    { phaseId: "foundation", label: "Foundations", weeks: 5 },
    { phaseId: "measurement", label: "Measurement", weeks: 5 },
    { phaseId: "experimentation", label: "Experimentation", weeks: 4 },
    { phaseId: "insights", label: "Insights", weeks: 4 },
  ],
  salaryPotential: {
    entry: "$105k–$130k",
    mid: "$130k–$155k",
    senior: "$155k–$180k+",
    notes: "Data science crossover roles trend toward upper band.",
  },
  resources: [
    ...sharedAiResources,
    { title: "Reforge — Experimentation", type: "course" },
    { title: "Eugene Yan — ML observability essays", type: "article" },
  ],
  milestones: [
    { title: "SQL portfolio", description: "Publish 3 analytical queries with narratives.", phaseId: "foundation", week: 5 },
    { title: "Dashboard MVP", description: "Ship AI health dashboard mock or live.", phaseId: "measurement", week: 10 },
    { title: "Case study presentation", description: "Present experiment readout to mock panel.", week: 16 },
  ],
  learningPath: [
    { step: 1, title: "Solidify SQL & events", description: "Instrument a sample AI funnel.", duration: "3 weeks" },
    { step: 2, title: "Learn eval metrics", description: "Pair human ratings with automated scores.", duration: "2 weeks" },
    { step: 3, title: "Run mock experiment", description: "Design, analyze, and recommend ship/kill.", duration: "3 weeks" },
    { step: 4, title: "Portfolio projects", description: "Two analytics case studies on ProductPath.", duration: "4 weeks" },
    { step: 5, title: "Interview drills", description: "Metrics cases and SQL live exercises.", duration: "2 weeks" },
  ],
};
