import type { RoleSlug, SkillDefinition } from "../../types/assessment";

const PRODUCT_MANAGEMENT_SKILLS: SkillDefinition[] = [
  {
    slug: "product-sense",
    name: "Product Sense",
    role: "product-management",
    category: "Core",
    related_topics: ["user empathy", "opportunity identification", "product intuition"],
    roadmap_sections: ["pm-foundations", "pm-execution-interviews"],
  },
  {
    slug: "metrics",
    name: "Product Metrics",
    role: "product-management",
    category: "Analytics",
    related_topics: ["north star", "retention", "funnels", "RCA"],
    roadmap_sections: ["pm-foundations", "ai-pm"],
  },
  {
    slug: "prioritization",
    name: "Prioritization",
    role: "product-management",
    category: "Strategy",
    related_topics: ["RICE", "impact vs effort", "roadmapping"],
    roadmap_sections: ["pm-foundations"],
  },
  {
    slug: "execution",
    name: "Product Execution",
    role: "product-management",
    category: "Delivery",
    related_topics: ["PRDs", "launch", "stakeholder alignment"],
    roadmap_sections: ["pm-execution-interviews", "ai-pm"],
  },
  {
    slug: "ai-pm-basics",
    name: "AI PM Basics",
    role: "product-management",
    category: "AI",
    related_topics: ["LLM constraints", "evals", "responsible AI"],
    roadmap_sections: ["ai-pm"],
  },
];

const PRODUCT_DESIGN_SKILLS: SkillDefinition[] = [
  {
    slug: "ux-thinking",
    name: "UX Thinking",
    role: "product-design",
    category: "Core",
    related_topics: ["user journeys", "usability", "research synthesis"],
    roadmap_sections: ["design-foundations", "ai-product-design"],
  },
  {
    slug: "ui-understanding",
    name: "UI Understanding",
    role: "product-design",
    category: "Craft",
    related_topics: ["visual hierarchy", "layout", "design systems"],
    roadmap_sections: ["design-foundations"],
  },
  {
    slug: "accessibility",
    name: "Accessibility",
    role: "product-design",
    category: "Quality",
    related_topics: ["WCAG", "keyboard navigation", "screen readers"],
    roadmap_sections: ["design-foundations"],
  },
  {
    slug: "ai-ux-basics",
    name: "AI UX Basics",
    role: "product-design",
    category: "AI",
    related_topics: ["copilots", "uncertainty UI", "trust patterns"],
    roadmap_sections: ["ai-product-design"],
  },
];

const PRODUCT_MARKETING_SKILLS: SkillDefinition[] = [
  {
    slug: "positioning",
    name: "Positioning",
    role: "product-marketing",
    category: "Core",
    related_topics: ["ICP", "differentiation", "category"],
    roadmap_sections: ["pmm-foundations", "ai-pmm"],
  },
  {
    slug: "gtm-strategy",
    name: "GTM Strategy",
    role: "product-marketing",
    category: "Launch",
    related_topics: ["launch planning", "channels", "tiered rollout"],
    roadmap_sections: ["pmm-foundations", "ai-pmm"],
  },
  {
    slug: "messaging",
    name: "Messaging",
    role: "product-marketing",
    category: "Narrative",
    related_topics: ["value proposition", "copy", "sales enablement"],
    roadmap_sections: ["pmm-foundations", "growth-distribution"],
  },
  {
    slug: "growth-thinking",
    name: "Growth Thinking",
    role: "product-marketing",
    category: "Growth",
    related_topics: ["PLG", "acquisition loops", "retention marketing"],
    roadmap_sections: ["growth-distribution", "ai-pmm"],
  },
];

const PRODUCT_ANALYTICS_SKILLS: SkillDefinition[] = [
  {
    slug: "product-metrics",
    name: "Product Metrics",
    role: "product-analytics",
    category: "Core",
    related_topics: ["retention", "activation", "north star", "AI metrics"],
    roadmap_sections: ["analytics-foundations", "ai-analytics"],
  },
  {
    slug: "sql-basics",
    name: "SQL Basics",
    role: "product-analytics",
    category: "Technical",
    related_topics: ["SELECT", "JOIN", "aggregations", "window functions"],
    roadmap_sections: ["analytics-foundations"],
  },
  {
    slug: "funnel-analysis",
    name: "Funnel Analysis",
    role: "product-analytics",
    category: "Analysis",
    related_topics: ["conversion", "segmentation", "drop-off diagnosis"],
    roadmap_sections: ["analytics-foundations", "analytics-portfolio-interviews"],
  },
  {
    slug: "experimentation",
    name: "Experimentation",
    role: "product-analytics",
    category: "Growth",
    related_topics: ["A/B tests", "hypothesis", "guardrail metrics"],
    roadmap_sections: ["ai-analytics"],
  },
];

const PRODUCT_OPERATIONS_SKILLS: SkillDefinition[] = [
  {
    slug: "workflow-optimization",
    name: "Workflow Optimization",
    role: "product-operations",
    category: "Core",
    related_topics: ["launch rituals", "SOPs", "cross-functional rhythm"],
    roadmap_sections: ["ops-foundations", "ai-ops"],
  },
  {
    slug: "kpi-analysis",
    name: "KPI Analysis",
    role: "product-operations",
    category: "Metrics",
    related_topics: ["leading vs lagging", "ops dashboards", "reporting"],
    roadmap_sections: ["ops-foundations"],
  },
  {
    slug: "operational-reasoning",
    name: "Operational Reasoning",
    role: "product-operations",
    category: "Execution",
    related_topics: ["stakeholder alignment", "risk", "playbooks"],
    roadmap_sections: ["ops-foundations", "ops-portfolio-interviews"],
  },
  {
    slug: "automation-thinking",
    name: "Automation Thinking",
    role: "product-operations",
    category: "Systems",
    related_topics: ["no-code automation", "AI workflows", "internal tools"],
    roadmap_sections: ["ops-foundations", "ai-ops"],
  },
];

const TAXONOMY: Record<RoleSlug, SkillDefinition[]> = {
  "product-management": PRODUCT_MANAGEMENT_SKILLS,
  "product-design": PRODUCT_DESIGN_SKILLS,
  "product-marketing": PRODUCT_MARKETING_SKILLS,
  "product-analytics": PRODUCT_ANALYTICS_SKILLS,
  "product-operations": PRODUCT_OPERATIONS_SKILLS,
};

export function getSkillsForRole(role: RoleSlug): SkillDefinition[] {
  return TAXONOMY[role] ?? [];
}

export function getSkillBySlug(role: RoleSlug, slug: string): SkillDefinition | undefined {
  return getSkillsForRole(role).find((s) => s.slug === slug);
}

export function getAllSkills(): SkillDefinition[] {
  return Object.values(TAXONOMY).flat();
}

export {
  TAXONOMY as skillTaxonomy,
  PRODUCT_MANAGEMENT_SKILLS,
  PRODUCT_DESIGN_SKILLS,
  PRODUCT_MARKETING_SKILLS,
  PRODUCT_ANALYTICS_SKILLS,
  PRODUCT_OPERATIONS_SKILLS,
};
