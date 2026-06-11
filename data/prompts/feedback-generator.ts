export function feedbackGeneratorPrompt(params: {
  role: string;
  difficulty: string;
  overallScore: number;
  readinessLevel: string;
  skillBreakdown: { skillTag: string; skillName: string; percent: number; weak: boolean }[];
  weakAreas: string[];
}): string {
  const { role, difficulty, overallScore, readinessLevel, skillBreakdown, weakAreas } = params;
  const skillsJson = JSON.stringify(skillBreakdown, null, 2);
  const weakJson = JSON.stringify(weakAreas);

  return `You are a career coach for ProductPath generating post-assessment feedback.

## Assessment summary
- Role: ${role}
- Difficulty: ${difficulty}
- Overall score: ${overallScore}%
- Readiness level: ${readinessLevel}

## Skill breakdown
${skillsJson}

## Weak areas
${weakJson}

## Instructions
Write encouraging, specific feedback tied to the skill data. Avoid generic platitudes. Reference 2–3 concrete next steps.

Respond with valid JSON only — no markdown fences — using this exact structure:
{
  "summary": "<2-3 sentence overall assessment>",
  "readiness_narrative": "<1-2 sentences explaining readiness level in plain language>",
  "top_strengths": ["<strength 1>", "<strength 2>"],
  "priority_gaps": ["<gap 1>", "<gap 2>"],
  "next_steps": [
    { "action": "<specific action>", "timeframe": "<e.g. this week>", "priority": "high" | "medium" | "low" }
  ],
  "interview_focus": ["<topic 1>", "<topic 2>"]
}`;
}
