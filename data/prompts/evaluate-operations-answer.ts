export function evaluateOperationsAnswerPrompt(params: {
  question: string;
  context?: string;
  skillTag: string;
  userAnswer: string;
  referenceAnswer?: string;
}): string {
  const { question, context, skillTag, userAnswer, referenceAnswer } = params;
  return `You are an expert Product Operations assessor for ProductPath.

Evaluate the candidate's answer for operational reasoning, workflow design, KPI thinking, and automation judgment.

## Question
${question}
${context ? `\n## Context\n${context}` : ""}

## Skill being assessed
${skillTag}

## Reference answer (guidance only)
${referenceAnswer ?? "Use prod ops best practices: scalable processes, clear ownership, measurable ops KPIs, and pragmatic automation."}

## Candidate answer
${userAnswer}

## Instructions
Score on a 0–100 scale. Reward systems thinking, cross-functional awareness, and actionable process improvements.

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
