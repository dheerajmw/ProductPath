import type { RoleCurriculum } from "./types";
import { PRODUCT_MANAGEMENT_CURRICULUM } from "./product-management";
import { PRODUCT_DESIGN_CURRICULUM } from "./product-design";
import { PRODUCT_ANALYTICS_CURRICULUM } from "./product-analytics";
import { PRODUCT_OPERATIONS_CURRICULUM } from "./product-operations";
import { PRODUCT_MARKETING_CURRICULUM } from "./product-marketing";
import { buildSeedModulesFromCurriculum } from "./types";

export * from "./types";
export { PRODUCT_MANAGEMENT_CURRICULUM } from "./product-management";
export { PRODUCT_DESIGN_CURRICULUM } from "./product-design";
export { PRODUCT_ANALYTICS_CURRICULUM } from "./product-analytics";
export { PRODUCT_OPERATIONS_CURRICULUM } from "./product-operations";
export { PRODUCT_MARKETING_CURRICULUM } from "./product-marketing";

const CURRICULA: Record<string, RoleCurriculum> = {
  "product-management": PRODUCT_MANAGEMENT_CURRICULUM,
  "product-design": PRODUCT_DESIGN_CURRICULUM,
  "product-analytics": PRODUCT_ANALYTICS_CURRICULUM,
  "product-operations": PRODUCT_OPERATIONS_CURRICULUM,
  "product-marketing": PRODUCT_MARKETING_CURRICULUM,
};

export function getCurriculumForRole(roleSlug: string): RoleCurriculum | undefined {
  return CURRICULA[roleSlug];
}

export function buildSeedModulesForRole(roleSlug: string) {
  const curriculum = getCurriculumForRole(roleSlug);
  if (!curriculum) return undefined;
  return buildSeedModulesFromCurriculum(curriculum);
}

/** @deprecated use buildSeedModulesForRole("product-marketing") */
export function buildProductMarketingSeedModules() {
  return buildSeedModulesFromCurriculum(PRODUCT_MARKETING_CURRICULUM);
}

export function hasCurriculum(roleSlug: string): boolean {
  return roleSlug in CURRICULA;
}

export function findCurriculumForModuleSlug(moduleSlug: string): RoleCurriculum | undefined {
  for (const curriculum of Object.values(CURRICULA)) {
    if (curriculum.phases.some((phase) => phase.moduleSlug === moduleSlug)) {
      return curriculum;
    }
  }
  return undefined;
}
