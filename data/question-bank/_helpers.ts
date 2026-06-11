import type { BankQuestion, Difficulty, RoleSlug } from "../../types/assessment";

type Base = {
  id: string;
  role: RoleSlug;
  difficulty: Difficulty;
  question: string;
  answer: string | number;
  explanation: string;
  skill_tag: string;
  estimated_time: number;
  context?: string;
};

export function mcq(
  base: Base & { options: string[]; answer: number },
): BankQuestion {
  return { ...base, type: "mcq" };
}

export function scenario(
  base: Base & { options: string[]; answer: number; context: string },
): BankQuestion {
  return { ...base, type: "scenario" };
}

export function shortAnswer(
  base: Base & { answer: string },
): BankQuestion {
  return { ...base, type: "short-answer", options: undefined };
}

export function pickQuestions(
  beginner: BankQuestion[],
  intermediate: BankQuestion[],
  difficulty: Difficulty,
  limit = 8,
): BankQuestion[] {
  const pool = difficulty === "beginner" ? beginner : intermediate;
  return pool.slice(0, limit);
}
