import type { RoleCurriculum } from "./types";

export const PRODUCT_ANALYTICS_CURRICULUM: RoleCurriculum = {
  roleSlug: "product-analytics",
  title: "AI Product Analytics Roadmap",
  phases: [
    {
      id: "phase-1",
      title: "Phase 1 — Analytics Foundations",
      order: 1,
      moduleSlug: "analytics-foundations",
      moduleTitle: "Analytics Foundations",
      moduleDescription: "SQL, product metrics, and data visualization fundamentals.",
      topics: [
        {
          id: "sql",
          number: 1,
          title: "SQL",
          learn: ["SELECT", "JOIN", "GROUP BY", "Window functions", "Aggregations"],
          resources: [
            { label: "Mode SQL tutorial", url: "https://mode.com/sql-tutorial/", type: "article" },
            { label: "SQL basics (YouTube)", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", type: "video" },
          ],
        },
        {
          id: "product-metrics",
          number: 2,
          title: "Product Metrics",
          learn: ["Retention", "Funnels", "Cohorts", "Activation", "Engagement"],
          resources: [
            { label: "Mixpanel blog", url: "https://mixpanel.com/blog/", type: "article" },
            { label: "Amplitude blog", url: "https://amplitude.com/blog", type: "article" },
            { label: "Product metrics (YouTube)", url: "https://www.youtube.com/watch?v=V6dQ4Yt0M7A", type: "video" },
          ],
        },
        {
          id: "data-viz",
          number: 3,
          title: "Data Visualization",
          learn: [
            "Dashboards",
            "Charts",
            "KPI visualization",
            "Tools: Tableau, Power BI, Metabase",
          ],
          resources: [
            { label: "Data viz (YouTube)", url: "https://www.youtube.com/watch?v=aHaOIvR00So", type: "video" },
            { label: "Tableau Public", url: "https://public.tableau.com/", type: "tool" },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2 — AI Product Analytics",
      order: 2,
      moduleSlug: "ai-analytics",
      moduleTitle: "AI Product Analytics",
      moduleDescription: "AI metrics, experimentation, and Python for analytics.",
      topics: [
        {
          id: "ai-metrics",
          number: 4,
          title: "AI Metrics",
          learn: ["Prompt success rate", "AI latency", "Hallucination rate", "AI adoption metrics"],
          resources: [
            { label: "OpenAI evals guide", url: "https://platform.openai.com/docs/guides/evals", type: "article" },
            { label: "AI evals (YouTube)", url: "https://www.youtube.com/watch?v=6sV3W6uM9WQ", type: "video" },
          ],
        },
        {
          id: "experimentation",
          number: 5,
          title: "Experimentation & A/B Testing",
          learn: ["Hypothesis testing", "Experiment design", "Statistical significance"],
          resources: [
            { label: "A/B testing (YouTube)", url: "https://www.youtube.com/watch?v=8c0oP8mT9g8", type: "video" },
            { label: "Optimizely A/B glossary", url: "https://www.optimizely.com/optimization-glossary/ab-testing/", type: "article" },
          ],
        },
        {
          id: "python",
          number: 6,
          title: "Python for Analytics",
          learn: ["Pandas", "NumPy", "Data cleaning", "Visualization"],
          resources: [
            { label: "Python analytics (YouTube)", url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI", type: "video" },
            { label: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "tool" },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3 — Portfolio & Interviews",
      order: 3,
      moduleSlug: "analytics-portfolio-interviews",
      moduleTitle: "Portfolio & Interviews",
      moduleDescription: "Analytics projects and interview preparation.",
      topics: [
        {
          id: "portfolio",
          number: 7,
          title: "Analytics Projects",
          build: ["Funnel analysis", "Cohort dashboard", "AI usage analytics", "Growth dashboards"],
          learn: ["Publish dashboards and write-ups publicly."],
          resources: [
            { label: "Kaggle", url: "https://www.kaggle.com/", type: "tool" },
            { label: "Looker Studio", url: "https://lookerstudio.google.com/", type: "tool" },
          ],
        },
        {
          id: "interviews",
          number: 8,
          title: "Product Analytics Interviews",
          learn: ["SQL rounds", "Metrics cases", "Product analysis", "Experimentation"],
          resources: [
            { label: "Exponent", url: "https://www.tryexponent.com/", type: "tool" },
            { label: "Exponent TV (YouTube)", url: "https://www.youtube.com/@ExponentTV", type: "video" },
          ],
        },
      ],
    },
  ],
  youtubeChannels: [
    { title: "Exponent TV", url: "https://www.youtube.com/@ExponentTV" },
  ],
  blogs: [
    { title: "Mixpanel blog", url: "https://mixpanel.com/blog/" },
    { title: "Amplitude blog", url: "https://amplitude.com/blog" },
    { title: "Mode Analytics", url: "https://mode.com/blog/" },
  ],
  careerStrategy: [
    "Build SQL + metrics portfolio projects on Kaggle",
    "Practice metrics and RCA cases weekly",
    "Create AI usage analytics dashboards",
    "Study experimentation frameworks deeply",
  ],
  hiringCompanies: ["Google", "Meta", "Stripe", "Spotify", "OpenAI", "Notion", "Amplitude", "Mixpanel"],
};
