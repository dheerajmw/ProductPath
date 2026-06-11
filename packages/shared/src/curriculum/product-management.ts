import type { RoleCurriculum } from "./types";

export const PRODUCT_MANAGEMENT_CURRICULUM: RoleCurriculum = {
  roleSlug: "product-management",
  title: "AI Product Management Roadmap",
  phases: [
    {
      id: "phase-1",
      title: "Phase 1 — Product Management Foundations",
      order: 1,
      moduleSlug: "pm-foundations",
      moduleTitle: "Product Management Foundations",
      moduleDescription: "PM basics, product sense, strategy, metrics, prioritization, and PRDs.",
      topics: [
        {
          id: "what-is-pm",
          number: 1,
          title: "What is Product Management?",
          learn: [
            "PM responsibilities",
            "Product lifecycle",
            "PM vs Project Manager",
            "Product thinking",
            "Cross-functional collaboration",
          ],
          resources: [
            { label: "What is PM? (YouTube)", url: "https://www.youtube.com/watch?v=yUOC-Y0f5ZQ", type: "video" },
            { label: "Product School — What is PM", url: "https://www.productschool.com/blog/product-management-2/what-is-product-management", type: "article" },
            { label: "Product School (YouTube)", url: "https://www.youtube.com/@ProductSchool", type: "video" },
          ],
        },
        {
          id: "product-sense",
          number: 2,
          title: "Product Sense",
          learn: ["User empathy", "Pain point identification", "Feature prioritization", "Product intuition"],
          resources: [
            { label: "Exponent", url: "https://www.tryexponent.com/", type: "tool" },
            { label: "Product sense (YouTube)", url: "https://www.youtube.com/watch?v=K5T4P4Qq0mU", type: "video" },
            { label: "Product intuition (YouTube)", url: "https://www.youtube.com/watch?v=bmSH7PZduYw", type: "video" },
          ],
        },
        {
          id: "product-strategy",
          number: 3,
          title: "Product Strategy",
          learn: ["Vision", "Strategy vs roadmap", "Competitive advantage", "Moats", "Market positioning"],
          resources: [
            { label: "Product strategy (YouTube)", url: "https://www.youtube.com/watch?v=iuYlGRnC7J8", type: "video" },
            { label: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/", type: "article" },
            { label: "Strategyzer blog", url: "https://www.strategyzer.com/blog", type: "article" },
          ],
        },
        {
          id: "product-metrics",
          number: 4,
          title: "Product Metrics",
          learn: ["North Star Metric", "DAU/MAU", "Retention", "Engagement", "Funnel metrics"],
          resources: [
            { label: "Mixpanel blog", url: "https://mixpanel.com/blog/", type: "article" },
            { label: "Amplitude blog", url: "https://amplitude.com/blog", type: "article" },
            { label: "Product metrics (YouTube)", url: "https://www.youtube.com/watch?v=V6dQ4Yt0M7A", type: "video" },
          ],
        },
        {
          id: "prioritization",
          number: 5,
          title: "Prioritization Frameworks",
          learn: ["RICE", "MoSCoW", "Kano", "Impact vs Effort"],
          resources: [
            { label: "RICE scoring model", url: "https://www.productplan.com/glossary/rice-scoring-model/", type: "article" },
            { label: "Prioritization (YouTube)", url: "https://www.youtube.com/watch?v=8dxZb5S8l2M", type: "video" },
          ],
        },
        {
          id: "prds",
          number: 6,
          title: "PRDs (Product Requirement Documents)",
          learn: ["Writing PRDs", "Scope definition", "User stories", "Acceptance criteria"],
          resources: [
            { label: "Atlassian — requirements", url: "https://www.atlassian.com/agile/product-management/requirements", type: "article" },
            { label: "Writing PRDs (YouTube)", url: "https://www.youtube.com/watch?v=8mV7k1J0x2Y", type: "video" },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2 — AI Product Management",
      order: 2,
      moduleSlug: "ai-pm",
      moduleTitle: "AI Product Management",
      moduleDescription: "LLM fundamentals, AI design patterns, and AI product evaluation.",
      topics: [
        {
          id: "llm-fundamentals",
          number: 7,
          title: "LLM Fundamentals",
          learn: ["Tokens", "Context windows", "Hallucinations", "RAG", "Fine-tuning", "AI agents"],
          resources: [
            { label: "LLM fundamentals (YouTube)", url: "https://www.youtube.com/watch?v=LPZh9BOjkQs", type: "video" },
            { label: "OpenAI docs", url: "https://platform.openai.com/docs", type: "tool" },
            { label: "Anthropic engineering", url: "https://www.anthropic.com/engineering", type: "article" },
          ],
        },
        {
          id: "ai-design-patterns",
          number: 8,
          title: "AI Product Design Patterns",
          learn: ["Copilots", "AI assistants", "AI search", "Workflow automation", "Conversational UX"],
          study: [
            { label: "ChatGPT", url: "https://chatgpt.com" },
            { label: "Cursor", url: "https://cursor.com" },
            { label: "Perplexity", url: "https://www.perplexity.ai" },
            { label: "Notion AI", url: "https://www.notion.so/product/ai" },
          ],
          resources: [
            { label: "AI product patterns (YouTube)", url: "https://www.youtube.com/watch?v=fmJangHf4Yc", type: "video" },
            { label: "Growth Design case studies", url: "https://growth.design/case-studies/", type: "article" },
          ],
        },
        {
          id: "ai-evaluation",
          number: 9,
          title: "AI Product Evaluation",
          learn: ["AI quality metrics", "Latency", "Reliability", "Human-in-loop systems"],
          resources: [
            { label: "AI evals (YouTube)", url: "https://www.youtube.com/watch?v=6sV3W6uM9WQ", type: "video" },
            { label: "OpenAI evals guide", url: "https://platform.openai.com/docs/guides/evals", type: "article" },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3 — Execution & Interviews",
      order: 3,
      moduleSlug: "pm-execution-interviews",
      moduleTitle: "Execution & Interviews",
      moduleDescription: "Product execution, teardowns, and PM interview preparation.",
      topics: [
        {
          id: "execution",
          number: 10,
          title: "Product Execution",
          learn: ["Roadmaps", "Sprint planning", "Stakeholder management", "Product launches"],
          resources: [
            { label: "Product execution (YouTube)", url: "https://www.youtube.com/watch?v=502ILHjX9EE", type: "video" },
            { label: "Atlassian Agile", url: "https://www.atlassian.com/agile", type: "article" },
          ],
        },
        {
          id: "teardowns",
          number: 11,
          title: "Product Teardowns",
          learn: ["Analyze products", "UX decisions", "Growth loops", "Monetization"],
          resources: [
            { label: "Growth Design", url: "https://growth.design/", type: "article" },
            { label: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/", type: "article" },
            { label: "Aakash Gupta (YouTube)", url: "https://www.youtube.com/@AakashGupta", type: "video" },
          ],
        },
        {
          id: "interviews",
          number: 12,
          title: "PM Interviews",
          learn: ["Product sense", "Metrics", "RCA", "Estimation", "Strategy"],
          resources: [
            { label: "Exponent", url: "https://www.tryexponent.com/", type: "tool" },
            { label: "Exponent TV (YouTube)", url: "https://www.youtube.com/@ExponentTV", type: "video" },
            { label: "Product Alliance (YouTube)", url: "https://www.youtube.com/@ProductAlliance", type: "video" },
          ],
        },
      ],
    },
  ],
  youtubeChannels: [
    { title: "Product School", url: "https://www.youtube.com/@ProductSchool" },
    { title: "Exponent TV", url: "https://www.youtube.com/@ExponentTV" },
    { title: "Product Alliance", url: "https://www.youtube.com/@ProductAlliance" },
    { title: "Aakash Gupta", url: "https://www.youtube.com/@AakashGupta" },
  ],
  blogs: [
    { title: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/" },
    { title: "Product School blog", url: "https://www.productschool.com/blog" },
    { title: "Strategyzer blog", url: "https://www.strategyzer.com/blog" },
    { title: "Growth Design", url: "https://growth.design/" },
  ],
  careerStrategy: [
    "Build AI PM case studies with eval-first PRDs",
    "Practice product sense and metrics weekly",
    "Publish product teardowns on LinkedIn",
    "Study successful AI product launches",
    "Complete mock interviews on Exponent",
  ],
  hiringCompanies: ["OpenAI", "Anthropic", "Google", "Microsoft", "Notion", "Stripe", "Figma", "Atlassian"],
};
