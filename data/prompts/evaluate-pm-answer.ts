export function evaluatePmAnswerPrompt(params: {
  question: string;
  context?: string;
  skillTag: string;
  userAnswer: string;
  referenceAnswer?: string;
}): string {
  const { question, context, skillTag, userAnswer, referenceAnswer } = params;
  return `You are an expert Product Management assessor for ProductPath.

Evaluate the candidate's answer for product thinking, structured reasoning, and communication clarity.

## Question
${question}
${context ? `\n## Context\n${context}` : ""}

## Skill being assessed
${skillTag}

## Reference answer (guidance only — not required verbatim match)
${referenceAnswer ?? "Use PM best practices: outcomes, user value, data-informed decisions, tradeoffs."}

## Candidate answer
${userAnswer}

## Instructions
Score the answer on a 0–100 scale. Be fair but rigorous. Partial credit is allowed for structured thinking even if details are incomplete.

Respond with valid JSON only — no markdown fences — using this exact structure:
{
  "score": <number 0-100>,
  "reasoning_quality": <number 0-100>,
  "clarity": <number 0-100>,
  "role_thinking": <number 0-100>,
  "feedback": "<2-4 sentences of constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;
}
