import type { ReadinessLevel, RoleBenchmark, RoleSlug } from "../../types/assessment";

const BENCHMARKS: Record<RoleSlug, RoleBenchmark> = {
  "product-management": {
    role: "product-management",
    thresholds: {
      beginner: 40,
      "internship-ready": 55,
      "apm-ready": 70,
      intermediate: 80,
    },
    passSkillFloor: 50,
  },
  "product-design": {
    role: "product-design",
    thresholds: {
      beginner: 40,
      "internship-ready": 55,
      "apm-ready": 68,
      intermediate: 78,
    },
    passSkillFloor: 50,
  },
  "product-marketing": {
    role: "product-marketing",
    thresholds: {
      beginner: 40,
      "internship-ready": 54,
      "apm-ready": 68,
      intermediate: 78,
    },
    passSkillFloor: 50,
  },
  "product-analytics": {
    role: "product-analytics",
    thresholds: {
      beginner: 42,
      "internship-ready": 58,
      "apm-ready": 72,
      intermediate: 82,
    },
    passSkillFloor: 52,
  },
  "product-operations": {
    role: "product-operations",
    thresholds: {
      beginner: 40,
      "internship-ready": 55,
      "apm-ready": 70,
      intermediate: 80,
    },
    passSkillFloor: 50,
  },
};

export function getBenchmark(role: RoleSlug): RoleBenchmark {
  const benchmark = BENCHMARKS[role];
  if (!benchmark) {
    throw new Error(`Unknown role: ${role}`);
  }
  return benchmark;
}

export function getReadinessLevel(role: RoleSlug, overallPercent: number): ReadinessLevel {
  const { thresholds } = getBenchmark(role);
  if (overallPercent >= thresholds.intermediate) return "intermediate";
  if (overallPercent >= thresholds["apm-ready"]) return "apm-ready";
  if (overallPercent >= thresholds["internship-ready"]) return "internship-ready";
  return "beginner";
}

export function passesAssessment(role: RoleSlug, overallPercent: number, minSkillPercent: number): boolean {
  const { passSkillFloor } = getBenchmark(role);
  return overallPercent >= getBenchmark(role).thresholds["apm-ready"] && minSkillPercent >= passSkillFloor;
}

export { BENCHMARKS as roleBenchmarks };
