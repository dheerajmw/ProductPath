import type { Roadmap, RoadmapSummary } from "./types/roadmap";
import { aiProductManagementRoadmap } from "./product-management";
import { aiProductDesignRoadmap } from "./product-design";
import { aiProductAnalyticsRoadmap } from "./product-analytics";
import { aiProductMarketingRoadmap } from "./product-marketing";
import { aiProductOperationsRoadmap } from "./product-operations";

/** Central registry — add new roadmaps here. */
export const ROADMAP_REGISTRY: Record<string, Roadmap> = {
  [aiProductManagementRoadmap.meta.slug]: aiProductManagementRoadmap,
  [aiProductDesignRoadmap.meta.slug]: aiProductDesignRoadmap,
  [aiProductAnalyticsRoadmap.meta.slug]: aiProductAnalyticsRoadmap,
  [aiProductMarketingRoadmap.meta.slug]: aiProductMarketingRoadmap,
  [aiProductOperationsRoadmap.meta.slug]: aiProductOperationsRoadmap,
};

export const ROADMAPS: Roadmap[] = Object.values(ROADMAP_REGISTRY);

export function getRoadmapBySlug(slug: string): Roadmap | undefined {
  return ROADMAP_REGISTRY[slug];
}

export function getAllRoadmapSlugs(): string[] {
  return Object.keys(ROADMAP_REGISTRY);
}

export function getRoadmapSummaries(): RoadmapSummary[] {
  return ROADMAPS.map((r) => r.meta);
}

export function roadmapExists(slug: string): boolean {
  return slug in ROADMAP_REGISTRY;
}

/** For future CMS/DB: normalize external document into Roadmap shape. */
export function normalizeRoadmapDocument(input: Roadmap): Roadmap {
  return {
    ...input,
    phases: [...input.phases].sort((a, b) => a.order - b.order),
    learningPath: [...input.learningPath].sort((a, b) => a.step - b.step),
  };
}

export {
  aiProductManagementRoadmap,
  aiProductDesignRoadmap,
  aiProductAnalyticsRoadmap,
  aiProductMarketingRoadmap,
  aiProductOperationsRoadmap,
};

export type { Roadmap, RoadmapSummary } from "./types/roadmap";
