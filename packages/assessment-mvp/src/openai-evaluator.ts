import type { AiEvaluationResult, BankQuestion, RoleSlug } from "../../../types/assessment";
import { evaluatePmAnswerPrompt } from "../../../data/prompts/evaluate-pm-answer.js";
import { evaluateDesignAnswerPrompt } from "../../../data/prompts/evaluate-design-answer.js";
import { evaluateMarketingAnswerPrompt } from "../../../data/prompts/evaluate-marketing-answer.js";
import { evaluateAnalyticsAnswerPrompt } from "../../../data/prompts/evaluate-analytics-answer.js";
import { evaluateOperationsAnswerPrompt } from "../../../data/prompts/evaluate-operations-answer.js";
import { feedbackGeneratorPrompt } from "../../../data/prompts/feedback-generator.js";
import { z } from "zod";

const aiEvalSchema = z.object({
  score: z.number().min(0).max(100),
  reasoning_quality: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  role_thinking: z.number().min(0).max(100),
  feedback: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

function promptForRole(role: RoleSlug) {
  const map: Record<RoleSlug, typeof evaluatePmAnswerPrompt> = {
    "product-management": evaluatePmAnswerPrompt,
    "product-design": evaluateDesignAnswerPrompt,
    "product-marketing": evaluateMarketingAnswerPrompt,
    "product-analytics": evaluateAnalyticsAnswerPrompt,
    "product-operations": evaluateOperationsAnswerPrompt,
  };
  return map[role];
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function evaluateShortAnswer(
  role: RoleSlug,
  question: BankQuestion,
  userAnswer: string,
): Promise<AiEvaluationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || question.type !== "short-answer") return null;

  const buildPrompt = promptForRole(role);
  const systemPrompt = buildPrompt({
    question: question.question,
    context: question.context,
    referenceAnswer: question.explanation,
    userAnswer,
    skillTag: question.skill_tag,
  });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userAnswer },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = aiEvalSchema.safeParse(JSON.parse(content));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function generateSessionFeedback(
  role: RoleSlug,
  overallScore: number,
  weakAreas: string[],
): Promise<string | undefined> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return undefined;

  const prompt = feedbackGeneratorPrompt({
    role,
    difficulty: "mixed",
    overallScore,
    readinessLevel: "n/a",
    skillBreakdown: [],
    weakAreas,
  });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.4,
        messages: [{ role: "system", content: prompt }],
      }),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim();
  } catch {
    return undefined;
  }
}
