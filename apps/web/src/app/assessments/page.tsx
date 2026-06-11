"use client";

import { useEffect, useState } from "react";
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
} from "@productpath/ui";
import { api, ApiError, type AssessmentHubResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function AssessmentsHubPage() {
  const router = useRouter();
  const [hub, setHub] = useState<AssessmentHubResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAssessmentHub()
      .then(setHub)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else if (err instanceof ApiError && err.code === "NO_ACTIVE_ROLE") router.push("/onboarding/role");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function startNew() {
    if (!hub) return;
    if (hub.activeAttempt) {
      router.push(`/assessments/${hub.activeAttempt.id}`);
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const attempt = await api.startAssessment(hub.assessment.id);
      router.push(`/assessments/${attempt.attempt.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Assessments">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (!hub) {
    return (
      <CandidateAppShell title="Assessments">
        <Alert variant="error">{error ?? "Unable to load"}</Alert>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Assessments">
      <Card>
        <CardContent>
          <CardTitle>{hub.assessment.title}</CardTitle>
          <CardDescription>
            {hub.role.name} · {hub.assessment.durationMinutes} minutes · Timed on the server
          </CardDescription>
          <p style={{ marginTop: 8, color: "var(--pp-muted)", fontSize: "0.875rem" }}>
            {hub.assessment.description}
          </p>

          {error ? (
            <div style={{ marginTop: 16 }}>
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}

          {hub.learningGate.warn && !hub.learningGate.blocked ? (
            <div style={{ marginTop: 16 }}>
              <Alert variant="info">
                Learning progress is                 {hub.learningGate.progressPercent}% (under{" "}
                {hub.learningGate.warnThreshold}%). Optional:{" "}
                <Link href="/learn/roadmaps">finish more roadmap modules</Link> before testing.
              </Alert>
            </div>
          ) : null}

          {hub.learningGate.blocked ? (
            <div style={{ marginTop: 16 }}>
              <Alert variant="error">
                Complete at least {hub.learningGate.blockThreshold}% of your roadmap before starting
                ({hub.learningGate.progressPercent}% now), or continue optional prep.{" "}
                <Link href="/learn/roadmaps">Browse roadmaps</Link>
                {" · "}
                <Link href="/learn">Prepare to learn</Link>
              </Alert>
            </div>
          ) : null}

          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button
              loading={starting}
              disabled={hub.learningGate.blocked || (!hub.retake.canStart && !hub.activeAttempt)}
              onClick={startNew}
            >
              {hub.activeAttempt ? "Resume attempt" : "Start assessment"}
            </Button>
            {hub.latestResult ? (
              <Link href={`/assessments/results/${hub.latestResult.attemptId}`}>
                <Button variant="secondary">View latest results</Button>
              </Link>
            ) : null}
            <Link href="/gaps">
              <Button variant="ghost">Skill gaps</Button>
            </Link>
          </div>

          <p style={{ marginTop: 16, fontSize: "0.8125rem", color: "var(--pp-muted)" }}>
            Attempts: {hub.retake.attemptsUsed} / {hub.retake.maxAttempts}
            {hub.retake.cooldownEndsAt && !hub.retake.canStart
              ? ` · Retake after ${new Date(hub.retake.cooldownEndsAt).toLocaleString()}`
              : ""}
          </p>
        </CardContent>
      </Card>
    </CandidateAppShell>
  );
}
