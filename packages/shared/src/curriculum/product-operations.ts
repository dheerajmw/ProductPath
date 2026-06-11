import type { RoleCurriculum } from "./types";

export const PRODUCT_OPERATIONS_CURRICULUM: RoleCurriculum = {
  roleSlug: "product-operations",
  title: "AI Product Operations Roadmap",
  phases: [
    {
      id: "phase-1",
      title: "Phase 1 — Operations Foundations",
      order: 1,
      moduleSlug: "ops-foundations",
      moduleTitle: "Operations Foundations",
      moduleDescription: "Product ops basics, workflow automation, and program management.",
      topics: [
        {
          id: "ops-basics",
          number: 1,
          title: "Product Operations Basics",
          learn: ["Operational workflows", "SOPs", "Cross-functional execution", "KPI tracking"],
          resources: [
            { label: "Product ops (YouTube)", url: "https://www.youtube.com/watch?v=Zn6Vh8M4J8A", type: "video" },
            { label: "Atlassian product operations", url: "https://www.atlassian.com/work-management/project-management/product-operations", type: "article" },
          ],
        },
        {
          id: "automation",
          number: 2,
          title: "Workflow Automation",
          learn: [
            "Process automation",
            "Workflow orchestration",
            "Internal tools",
            "Tools: Zapier, Make, Airtable, Notion",
          ],
          resources: [
            { label: "Zapier blog", url: "https://zapier.com/blog/", type: "article" },
            { label: "Workflow automation (YouTube)", url: "https://www.youtube.com/watch?v=iP8mASSXqVQ", type: "video" },
          ],
        },
        {
          id: "program-mgmt",
          number: 3,
          title: "Program Management",
          learn: ["Project coordination", "Stakeholder communication", "Risk management"],
          resources: [
            { label: "Program management (YouTube)", url: "https://www.youtube.com/watch?v=9LSXo0rGf4g", type: "video" },
            { label: "Asana PM basics", url: "https://asana.com/resources/project-management-basics", type: "article" },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2 — AI Product Operations",
      order: 2,
      moduleSlug: "ai-ops",
      moduleTitle: "AI Product Operations",
      moduleDescription: "AI workflow systems, support operations, and internal AI tools.",
      topics: [
        {
          id: "ai-workflows",
          number: 4,
          title: "AI Workflow Systems",
          learn: ["AI automation", "AI pipelines", "Prompt operations", "AI monitoring"],
          resources: [
            { label: "LLM fundamentals (YouTube)", url: "https://www.youtube.com/watch?v=LPZh9BOjkQs", type: "video" },
            { label: "OpenAI docs", url: "https://platform.openai.com/docs", type: "tool" },
          ],
        },
        {
          id: "ai-support",
          number: 5,
          title: "AI Support Operations",
          learn: ["AI customer support systems", "AI escalation workflows", "Human-in-loop review systems"],
          resources: [
            { label: "Intercom AI customer service", url: "https://www.intercom.com/blog/ai-customer-service/", type: "article" },
            { label: "AI support ops (YouTube)", url: "https://www.youtube.com/watch?v=3K0xzg6M3xM", type: "video" },
          ],
        },
        {
          id: "internal-ai-tools",
          number: 6,
          title: "Internal AI Tools",
          learn: ["AI dashboards", "Knowledge systems", "AI productivity tooling"],
          study: [
            { label: "Notion AI", url: "https://www.notion.so/product/ai" },
            { label: "Slack AI", url: "https://slack.com/features/ai" },
            { label: "Linear", url: "https://linear.app" },
            { label: "Retool", url: "https://retool.com" },
          ],
          resources: [
            { label: "Retool blog", url: "https://retool.com/blog/", type: "article" },
            { label: "Retool (YouTube)", url: "https://www.youtube.com/@Retool", type: "video" },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3 — Portfolio & Interviews",
      order: 3,
      moduleSlug: "ops-portfolio-interviews",
      moduleTitle: "Portfolio & Interviews",
      moduleDescription: "Product ops portfolio projects and interview preparation.",
      topics: [
        {
          id: "portfolio",
          number: 7,
          title: "Product Ops Portfolio",
          build: ["Automation systems", "SOP documentation", "AI workflows", "KPI dashboards"],
          learn: ["Document and share ops playbooks publicly."],
          resources: [
            { label: "Notion templates", url: "https://www.notion.so/templates", type: "tool" },
            { label: "Airtable templates", url: "https://airtable.com/templates", type: "tool" },
          ],
        },
        {
          id: "interviews",
          number: 8,
          title: "Product Operations Interviews",
          learn: ["Operational scenarios", "Process optimization", "Stakeholder management", "Metrics tracking"],
          resources: [
            { label: "Product School (YouTube)", url: "https://www.youtube.com/@ProductSchool", type: "video" },
            { label: "Exponent", url: "https://www.tryexponent.com/", type: "tool" },
          ],
        },
      ],
    },
  ],
  youtubeChannels: [
    { title: "Product School", url: "https://www.youtube.com/@ProductSchool" },
    { title: "Retool", url: "https://www.youtube.com/@Retool" },
  ],
  blogs: [
    { title: "Zapier blog", url: "https://zapier.com/blog/" },
    { title: "Retool blog", url: "https://retool.com/blog/" },
    { title: "Intercom blog", url: "https://www.intercom.com/blog/" },
  ],
  careerStrategy: [
    "Build automation and SOP portfolio projects",
    "Document AI workflow systems you've designed",
    "Practice operational scenario interviews",
    "Learn internal tooling (Retool, Notion, Airtable)",
  ],
  hiringCompanies: ["OpenAI", "Stripe", "Notion", "Atlassian", "Linear", "Intercom", "Google", "Microsoft"],
};
