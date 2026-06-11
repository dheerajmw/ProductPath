"use client";

import type { MvpAssessmentResultResponse } from "@/lib/api";
import { SkillRadarChart } from "@/components/assessment/skill-radar-chart";
import { WeakAreasCard } from "@/components/assessment/weak-areas-card";
import { RecommendedResources } from "@/components/assessment/recommended-resources";

type Props = {
  data: MvpAssessmentResultResponse["result"];
};

export function ResultCard({ data }: Props) {
  return (
    <div className="pp-mvp-results">
      <header className="pp-glass-card pp-mvp-results-hero">
        <p className="pp-label-caps">{data.roleName}</p>
        <h1>{Math.round(data.overallScore)}%</h1>
        <p className="pp-mvp-readiness">
          Readiness: <strong>{data.readinessLevel.replace(/-/g, " ")}</strong>
        </p>
        <p className={data.passed ? "pp-mvp-pass" : "pp-mvp-fail"}>
          {data.passed ? "Passed APM-ready threshold" : "Keep learning — retake when ready"}
        </p>
        {data.aiFeedback ? <p className="pp-mvp-ai-feedback">{data.aiFeedback}</p> : null}
      </header>

      <SkillRadarChart skills={data.skillBreakdown} />
      <WeakAreasCard areas={data.weakAreas} recommendations={data.roadmapRecommendations} />
      <RecommendedResources resources={data.recommendedResources} />
    </div>
  );
}
