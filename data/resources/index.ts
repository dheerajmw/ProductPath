import type { LearningResource, RoleSlug } from "../../types/assessment";
import { productManagementResources } from "./product-management";
import { productDesignResources } from "./product-design";
import { productMarketingResources } from "./product-marketing";
import { productAnalyticsResources } from "./product-analytics";
import { productOperationsResources } from "./product-operations";

const REGISTRY: Record<RoleSlug, LearningResource[]> = {
  "product-management": productManagementResources,
  "product-design": productDesignResources,
  "product-marketing": productMarketingResources,
  "product-analytics": productAnalyticsResources,
  "product-operations": productOperationsResources,
};

export function getResourcesForRole(role: RoleSlug): LearningResource[] {
  return REGISTRY[role] ?? [];
}

export function getResourcesByTopic(role: RoleSlug, topic: string): LearningResource[] {
  return getResourcesForRole(role).filter((r) => r.topic === topic);
}

export {
  productManagementResources,
  productDesignResources,
  productMarketingResources,
  productAnalyticsResources,
  productOperationsResources,
};
