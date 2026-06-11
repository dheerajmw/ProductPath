import type { Difficulty, RoleSlug } from "../../../types/assessment";
import { beginnerQuestions } from "./beginner";
import { intermediateQuestions } from "./intermediate";

export { beginnerQuestions } from "./beginner";
export { intermediateQuestions } from "./intermediate";

export function getQuestions(difficulty: Difficulty) {
  return difficulty === "beginner" ? beginnerQuestions : intermediateQuestions;
}

export const role: RoleSlug = "product-operations";
