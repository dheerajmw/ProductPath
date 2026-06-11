import type { BankQuestion, Difficulty, RoleSlug } from "../../types/assessment";
import * as productManagement from "./product-management";
import * as productDesign from "./product-design";
import * as productMarketing from "./product-marketing";
import * as productAnalytics from "./product-analytics";
import * as productOperations from "./product-operations";

type RoleBank = {
  role: RoleSlug;
  getQuestions: (difficulty: Difficulty) => BankQuestion[];
};

const REGISTRY: Record<RoleSlug, RoleBank> = {
  "product-management": productManagement,
  "product-design": productDesign,
  "product-marketing": productMarketing,
  "product-analytics": productAnalytics,
  "product-operations": productOperations,
};

export function getQuestionBank(role: RoleSlug, difficulty: Difficulty): BankQuestion[] {
  const bank = REGISTRY[role];
  if (!bank) {
    throw new Error(`Unknown role: ${role}`);
  }
  return bank.getQuestions(difficulty);
}

export function getAllRoles(): RoleSlug[] {
  return Object.keys(REGISTRY) as RoleSlug[];
}

export { REGISTRY as questionBankRegistry };
export * from "./_helpers";
export * as productManagement from "./product-management";
export * as productDesign from "./product-design";
export * as productMarketing from "./product-marketing";
export * as productAnalytics from "./product-analytics";
export * as productOperations from "./product-operations";
