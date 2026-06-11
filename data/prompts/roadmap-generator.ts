export function roadmapGeneratorPrompt(params: {
  role: string;
  targetLevel: string;
  weakSkills: { slug: string; name: string; percent: number }[];
  availableTopics: string[];
}): string {
  const { role, targetLevel, weakSkills, availableTopics } = params;
  const weakJson = JSON.stringify(weakSkills, null, 2);
  const topicsJson = JSON.stringify(availableTopics);

  return `You are a learning roadmap advisor for ProductPath.

Generate a personalized study plan based on assessment gaps. Prefer topics from the available list when possible.

## Candidate context
- Role: ${role}
- Target level: ${targetLevel}

## Weak skills (lowest scores first)
${weakJson}

## Available roadmap topics (prefer these)
${topicsJson}

## Instructions
Recommend a focused 4–6 week plan. Prioritize high-impact gaps. Include at least one project suggestion.

Respond with valid JSON only — no markdown fences — using this exact structure:
{
  "headline": "<motivating one-line plan title>",
  "duration_weeks": <number 4-8>,
  "recommendations": [
    {
      "topic": "<topic from available list or closely related>",
      "reason": "<why this addresses a gap>",
      "priority": "high" | "medium" | "low",
      "estimated_hours": <number>
    }
  ],
  "projects": [
    {
      "title": "<project title>",
      "description": "<what to build or document>",
      "skills_addressed": ["<skill slug>"],
      "difficulty": "beginner" | "intermediate"
    }
  ],
  "interview_prep": ["<focus area 1>", "<focus area 2>"],
  "weekly_plan": [
    { "week": 1, "focus": "<theme>", "tasks": ["<task 1>", "<task 2>"] }
  ]
}`;
}
