"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Alert,
  Spinner,
  ListCard,
  ListCardGrid,
} from "@productpath/ui";
import { api, ApiError, type AssessmentResultResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<AssessmentResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAttemptResult(attemptId)
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load results");
      })
      .finally(() => setLoading(false));
  }, [attemptId, router]);

  if (loading) {
    return (
      <CandidateAppShell title="Results">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (error || !data) {
    return (
      <CandidateAppShell title="Results">
        <Alert variant="error">{error ?? "Not found"}</Alert>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Results">
      <Card>
        <CardContent>
          <CardTitle>{data.result.assessmentTitle}</CardTitle>
          <CardDescription>Assessment results</CardDescription>
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
              {Math.round(data.result.overallScore)}%
            </p>
            <Alert variant={data.result.passed ? "success" : "info"}>
              {data.result.passed
                ? "You met the passing threshold for this assessment."
                : "You did not meet the full passing criteria yet. Review skill gaps below."}
            </Alert>
          </div>
        </CardContent>
      </Card>

      <section style={{ marginTop: 28 }}>
        <h2 className="pp-section-title">Skill breakdown</h2>
        <ListCardGrid as="div">
          {data.scoresBySkill.map((s) => (
            <ListCard
              key={s.skillId}
              as="div"
              title={s.skillName}
              status={s.score >= 70 ? "success" : "default"}
              action={<strong style={{ fontSize: "1.125rem", color: "var(--pp-primary)" }}>{s.score}%</strong>}
            />
          ))}
        </ListCardGrid>
      </section>

      {data.gaps.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: "1.125rem" }}>Gaps to address</h2>
          <ul style={{ paddingLeft: 20 }}>
            {data.gaps.map((g) => (
              <li key={g.skillId}>
                {g.skillName}: {g.score}% (need {g.floor}%)
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/gaps">
          <Button>View recommended next steps</Button>
        </Link>
        <Link href="/assessments">
          <Button variant="secondary">Assessment hub</Button>
        </Link>
      </div>
    </CandidateAppShell>
  );
}
