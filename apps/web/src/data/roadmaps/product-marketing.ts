import type { Roadmap } from "./types/roadmap";
import { PRODUCT_MARKETING_CURRICULUM } from "../learning/product-marketing-curriculum";

const phases = PRODUCT_MARKETING_CURRICULUM.phases.map((phase) => ({
  id: phase.id,
  title: phase.moduleTitle,
  description: phase.moduleDescription,
  duration: phase.topics.length <= 2 ? "2–3 weeks" : "3–4 weeks",
  order: phase.order,
}));

export const aiProductMarketingRoadmap: Roadmap = {
  meta: {
    slug: "ai-product-marketing",
    title: "AI Product Marketing",
    description:
      "19 topics across 7 phases — PMM foundations, growth, AI marketing, analytics, tools, portfolio, and interview prep.",
    targetRoles: [
      "AI Product Marketing Manager",
      "PMM — Platform AI",
      "Growth Marketing Lead",
      "Developer Marketing (AI)",
    ],
    difficulty: "intermediate",
    estimatedDuration: "7–9 months",
    aiFocusLevel: "applied",
    salaryRange: { min: 100000, max: 175000, currency: "USD", region: "US remote/hybrid" },
    jobDemandScore: 7,
    tags: ["GTM", "positioning", "PLG", "AI launches"],
  },
  phases,
  skills: [
    { name: "PMM foundations & ICP", category: "Core", level: "beginner", phaseId: "phase-1" },
    { name: "Positioning & GTM", category: "Strategy", level: "intermediate", phaseId: "phase-1" },
    { name: "Growth & PLG", category: "Growth", level: "intermediate", phaseId: "phase-2" },
    { name: "Copywriting & content", category: "Content", level: "intermediate", phaseId: "phase-2" },
    { name: "AI product positioning", category: "AI", level: "intermediate", phaseId: "phase-3" },
    { name: "AI onboarding & virality", category: "AI", level: "advanced", phaseId: "phase-3" },
    { name: "Marketing metrics", category: "Analytics", level: "intermediate", phaseId: "phase-4" },
    { name: "PMM tools stack", category: "Tools", level: "intermediate", phaseId: "phase-5" },
  ],
  tools: [
    { name: "HubSpot", category: "Marketing automation", description: "Campaigns, CRM, and academy." },
    { name: "Mixpanel / Amplitude", category: "Product analytics", description: "Funnels, cohorts, activation." },
    { name: "GA4", category: "Web analytics", description: "Traffic and conversion tracking." },
    { name: "Ahrefs / Semrush", category: "SEO & competitive intel", description: "Keyword and competitor research." },
    { name: "Notion / Figma", category: "Docs & creative", description: "GTM docs, decks, and assets." },
  ],
  projects: [
    {
      title: "AI product launch plan",
      description: "Full GTM plan with positioning, channels, and success metrics.",
      outcomes: ["Launch checklist", "Messaging doc", "Channel plan"],
      difficulty: "advanced",
    },
    {
      title: "Product teardown & positioning analysis",
      description: "Competitive map with differentiated narrative for an AI product.",
      outcomes: ["Teardown post", "Positioning canvas", "LinkedIn proof"],
      difficulty: "intermediate",
    },
    {
      title: "AI onboarding redesign",
      description: "First-value UX for an AI copilot with prompt onboarding.",
      outcomes: ["UX audit", "Redesign proposal", "Activation metrics"],
      difficulty: "advanced",
    },
  ],
  interviewPrep: [
    {
      topic: "Product positioning",
      tips: ["Lead with ICP and wedge", "Tie claims to verifiable product behavior"],
      sampleQuestions: ["How would you position a new AI feature against incumbents?"],
    },
    {
      topic: "GTM & launch strategy",
      tips: ["Tier launches by risk", "Plan enablement before campaigns"],
      sampleQuestions: ["Walk me through a Product Hunt launch for an AI tool."],
    },
    {
      topic: "Metrics & growth",
      tips: ["Connect CAC to channel mix", "Define activation for AI products"],
      sampleQuestions: ["What metrics would you track for an AI freemium product?"],
    },
  ],
  timelines: phases.map((phase) => ({
    phaseId: phase.id,
    label: phase.title,
    weeks: phase.order <= 3 ? 4 : 3,
  })),
  salaryPotential: {
    entry: "$100k–$125k",
    mid: "$125k–$150k",
    senior: "$150k–$175k+",
    notes: "AI-native companies (OpenAI, Anthropic, Cursor) often pay at top of band.",
  },
  resources: [
    ...PRODUCT_MARKETING_CURRICULUM.blogs.map((b) => ({
      title: b.title,
      type: "article" as const,
      url: b.url,
    })),
    ...PRODUCT_MARKETING_CURRICULUM.youtubeChannels.slice(0, 4).map((channel) => ({
      title: channel.title,
      type: "video" as const,
      url: channel.url,
    })),
  ],
  milestones: [
    { title: "Complete Phase 1 foundations", description: "ICP, positioning, GTM, and competitive analysis.", phaseId: "phase-1", week: 4 },
    { title: "Publish a product teardown", description: "Share competitive analysis on LinkedIn.", phaseId: "phase-3", week: 12 },
    { title: "Portfolio + mock interview", description: "Launch plan deck and PMM case prep.", phaseId: "phase-7", week: 28 },
  ],
  learningPath: PRODUCT_MARKETING_CURRICULUM.phases.map((phase, index) => ({
    step: index + 1,
    title: phase.moduleTitle,
    description: `${phase.topics.length} topic${phase.topics.length === 1 ? "" : "s"} — ${phase.topics.map((t) => t.title).slice(0, 2).join(", ")}${phase.topics.length > 2 ? "…" : ""}`,
    duration: phase.topics.length <= 2 ? "2–3 weeks" : "3–4 weeks",
  })),
};
