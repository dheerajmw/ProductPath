import type { RoleCurriculum } from "./types";

export const PRODUCT_DESIGN_CURRICULUM: RoleCurriculum = {
  roleSlug: "product-design",
  title: "AI Product Design Roadmap",
  phases: [
    {
      id: "phase-1",
      title: "Phase 1 — Design Foundations",
      order: 1,
      moduleSlug: "design-foundations",
      moduleTitle: "Design Foundations",
      moduleDescription: "UX fundamentals, UI design, and Figma mastery.",
      topics: [
        {
          id: "ux-fundamentals",
          number: 1,
          title: "UX Fundamentals",
          learn: ["UX principles", "User journeys", "Accessibility", "Wireframing"],
          resources: [
            { label: "UX fundamentals (YouTube)", url: "https://www.youtube.com/watch?v=Ovj4hFxko7c", type: "video" },
            { label: "Laws of UX", url: "https://lawsofux.com/", type: "article" },
            { label: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/", type: "article" },
          ],
        },
        {
          id: "ui-design",
          number: 2,
          title: "UI Design",
          learn: ["Typography", "Layout", "Spacing", "Visual hierarchy", "Color systems"],
          resources: [
            { label: "UI design (YouTube)", url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU", type: "video" },
            { label: "Refactoring UI", url: "https://refactoringui.com/", type: "article" },
            { label: "Figma Learn Design", url: "https://www.figma.com/resources/learn-design/", type: "tool" },
          ],
        },
        {
          id: "figma",
          number: 3,
          title: "Figma Mastery",
          learn: ["Components", "Auto-layout", "Prototyping", "Design systems"],
          resources: [
            { label: "Figma tutorial (YouTube)", url: "https://www.youtube.com/watch?v=jwCmIBJ8Jtc", type: "video" },
            { label: "Figma Help Center", url: "https://help.figma.com/", type: "tool" },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2 — AI Product Design",
      order: 2,
      moduleSlug: "ai-product-design",
      moduleTitle: "AI Product Design",
      moduleDescription: "AI UX patterns, human-AI interaction, and AI design systems.",
      topics: [
        {
          id: "ai-ux-patterns",
          number: 4,
          title: "AI UX Patterns",
          learn: ["Conversational interfaces", "Streaming responses", "AI feedback loops", "Prompt UX"],
          resources: [
            { label: "Growth Design case studies", url: "https://growth.design/case-studies/", type: "article" },
            { label: "AI onboarding UX (YouTube)", url: "https://www.youtube.com/watch?v=wL5rW4V7q8Q", type: "video" },
          ],
        },
        {
          id: "human-ai",
          number: 5,
          title: "Human-AI Interaction",
          learn: ["Trust design", "AI explainability", "Error handling", "AI transparency"],
          resources: [
            { label: "NN/g AI UX", url: "https://www.nngroup.com/articles/ai-user-experience/", type: "article" },
            { label: "Human-AI interaction (YouTube)", url: "https://www.youtube.com/watch?v=JfVOs4VSpmA", type: "video" },
          ],
        },
        {
          id: "ai-design-systems",
          number: 6,
          title: "AI Design Systems",
          learn: ["Scalable AI interfaces", "Reusable patterns", "AI states/loading patterns"],
          study: [
            { label: "Cursor", url: "https://cursor.com" },
            { label: "Perplexity", url: "https://www.perplexity.ai" },
            { label: "ChatGPT", url: "https://chatgpt.com" },
            { label: "Notion AI", url: "https://www.notion.so/product/ai" },
          ],
          resources: [
            { label: "Figma Community", url: "https://www.figma.com/community", type: "tool" },
            { label: "DesignCourse (YouTube)", url: "https://www.youtube.com/@DesignCourse", type: "video" },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3 — Portfolio & Interviews",
      order: 3,
      moduleSlug: "design-portfolio-interviews",
      moduleTitle: "Portfolio & Interviews",
      moduleDescription: "Build AI design portfolio projects and prepare for design interviews.",
      topics: [
        {
          id: "portfolio",
          number: 7,
          title: "Portfolio Building",
          build: ["AI app redesigns", "Dashboard systems", "AI onboarding flows", "AI copilots"],
          learn: ["Post case studies on Behance, Dribbble, and your portfolio site."],
          resources: [
            { label: "Behance", url: "https://www.behance.net/", type: "tool" },
            { label: "Dribbble", url: "https://dribbble.com/", type: "tool" },
            { label: "Mobbin", url: "https://mobbin.com/", type: "tool" },
          ],
        },
        {
          id: "interviews",
          number: 8,
          title: "Product Design Interviews",
          learn: ["Whiteboarding", "UX critique", "Case studies", "Design rationale"],
          resources: [
            { label: "Femke Design (YouTube)", url: "https://www.youtube.com/@FemkeDesign", type: "video" },
            { label: "Mizko (YouTube)", url: "https://www.youtube.com/@Mizko", type: "video" },
            { label: "Designership", url: "https://www.designership.com/", type: "article" },
          ],
        },
      ],
    },
  ],
  youtubeChannels: [
    { title: "DesignCourse", url: "https://www.youtube.com/@DesignCourse" },
    { title: "Femke Design", url: "https://www.youtube.com/@FemkeDesign" },
    { title: "Mizko", url: "https://www.youtube.com/@Mizko" },
  ],
  blogs: [
    { title: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/" },
    { title: "Growth Design", url: "https://growth.design/" },
    { title: "Laws of UX", url: "https://lawsofux.com/" },
  ],
  careerStrategy: [
    "Build AI UX case studies with before/after flows",
    "Study AI products (ChatGPT, Cursor, Perplexity) weekly",
    "Publish teardown content on LinkedIn",
    "Practice whiteboard and critique rounds",
  ],
  hiringCompanies: ["OpenAI", "Figma", "Notion", "Google", "Microsoft", "Perplexity", "Cursor", "Canva"],
};
