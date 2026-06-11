export function evaluateMarketingAnswerPrompt(params: {
  question: string;
  context?: string;
  skillTag: string;
  userAnswer: string;
  referenceAnswer?: string;
}): string {
  const { question, context, skillTag, userAnswer, referenceAnswer } = params;
  return `You are an expert Product Marketing assessor for ProductPath.

Evaluate the candidate's answer for positioning clarity, GTM thinking, messaging quality, and growth reasoning.

## Question
${question}
${context ? `\n## Context\n${context}` : ""}

## Skill being assessed
${skillTag}

## Reference answer (guidance only)
${referenceAnswer ?? "Use PMM best practices: ICP focus, differentiated value, channel fit, and measurable outcomes."}

## Candidate answer
${userAnswer}

## Instructions
Score on a 0–100 scale. Reward specificity, audience awareness, and credible go-to-market logic.

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
