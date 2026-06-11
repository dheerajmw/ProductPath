"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  Alert,
  Spinner,
  EmptyState,
  Button,
  ListCard,
  ListCardGrid,
} from "@productpath/ui";
import { api, ApiError, type RecommendationsResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function GapsPage() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    return api
      .getRecommendations()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.code === "NO_RESULTS") {
          setError("Complete an assessment first to see skill gaps and recommendations.");
          return;
        }
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [router]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      const next = await api.refreshRecommendations();
      setData(next);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Skill gaps">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  const hasGaps = data && data.gaps.length > 0;

  return (
    <CandidateAppShell title="Skill gaps">
      <Card>
        <CardContent>
          <CardTitle>Skill gaps & development</CardTitle>
          {data ? (
            <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>
              Latest score: {Math.round(data.overallScore)}% ·{" "}
              {data.passed ? "Passed" : "Not yet passing"}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="info">{error}</Alert>
          <Link href="/assessments">
            <Button style={{ marginTop: 12 }}>Go to assessments</Button>
          </Link>
        </div>
      ) : null}

      {data && hasGaps ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="info">
            {data.retakeNote} You can still explore projects, but interview-ready verification
            requires closing gaps via a passing retake (D-09).
          </Alert>
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/projects">
              <Button variant="secondary">Go to projects hub</Button>
            </Link>
            <Button variant="ghost" onClick={onRefresh} disabled={refreshing}>
              {refreshing ? "Refreshing…" : "Refresh recommendations"}
            </Button>
          </div>
        </div>
      ) : null}

      {data && data.gaps.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <EmptyState
            title="No skill gaps"
            description="All skills met the floor on your latest assessment. Consider projects to build proof of work."
          />
          <Link href="/projects">
            <Button style={{ marginTop: 16 }}>Projects hub</Button>
          </Link>
        </div>
      ) : null}

      {data && data.recommendations.length > 0 ? (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          {data.recommendations.map((rec) => (
            <Card key={rec.skillId}>
              <CardContent>
                <CardTitle>{rec.skillName}</CardTitle>
                <p style={{ margin: "6px 0 12px", fontSize: "0.875rem", color: "var(--pp-muted)" }}>
                  Score {rec.score}% — {rec.gap} points below target ({rec.floor}%)
                </p>
                {rec.emptyContent ? (
                  <Alert variant="info">Recommended content coming soon for this skill.</Alert>
                ) : (
                  <ListCardGrid style={{ marginTop: 12 }}>
                    {rec.modules.map((mod) => (
                      <ListCard
                        key={mod.id}
                        status={mod.completed ? "completed" : "default"}
                        title={mod.title}
                        description={mod.completed ? "Completed" : "Recommended module"}
                        action={
                          <Link href={`/learn/${mod.id}`}>
                            <Button size="sm" variant={mod.completed ? "secondary" : "primary"}>
                              {mod.completed ? "Review" : "Start"}
                            </Button>
                          </Link>
                        }
                      />
                    ))}
                  </ListCardGrid>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/learn/roadmaps">
          <Button variant="secondary">Optional roadmaps</Button>
        </Link>
        <Link href="/assessments">
          <Button variant="secondary">Retake assessment</Button>
        </Link>
      </div>
    </CandidateAppShell>
  );
}
