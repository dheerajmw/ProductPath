"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  Button,
  Alert,
  Spinner,
} from "@productpath/ui";
import { api, ApiError, type AttemptStateResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AssessmentAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<AttemptStateResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const load = useCallback(() => {
    return api.getAttempt(attemptId).then((d) => {
      setData(d);
      setIndex(d.attempt.currentQuestionIndex);
      setSecondsLeft(d.attempt.secondsRemaining);
    });
  }, [attemptId]);

  useEffect(() => {
    load()
      .catch((err) => {
        if (err instanceof ApiError && err.code === "ATTEMPT_EXPIRED") {
          router.push(`/assessments/results/${attemptId}`);
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [load, attemptId, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          submit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.attempt.id]);

  async function selectOption(selectedIndex: number) {
    if (!data) return;
    const q = data.questions[index];
    try {
      const updated = await api.saveAnswer(attemptId, {
        questionId: q.id,
        selectedIndex,
        currentQuestionIndex: index,
      });
      setData(updated);
      setSecondsLeft(updated.attempt.secondsRemaining);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    }
  }

  async function submit(auto = false) {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitAttempt(attemptId);
      router.push(`/assessments/results/${attemptId}`);
    } catch (err) {
      if (!auto) setError(err instanceof ApiError ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !data) {
    return (
      <CandidateAppShell title="Assessment">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  const q = data.questions[index];
  const answeredCount = data.questions.filter((x) => x.answered).length;

  return (
    <CandidateAppShell title="Assessment">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <strong>{data.assessment.title}</strong>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--pp-muted)" }}>
            Question {index + 1} of {data.questions.length} · {answeredCount} answered
          </p>
        </div>
        <div style={{ fontWeight: 700, color: secondsLeft < 300 ? "var(--pp-danger)" : "var(--pp-fg)" }}>
          {formatTime(secondsLeft)}
        </div>
      </div>

      {error ? (
        <div style={{ marginBottom: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <Card>
        <CardContent>
          <CardTitle>{q.prompt}</CardTitle>
          <div className="pp-choice-grid">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={`pp-choice-option${q.selectedIndex === i ? " pp-choice-option--selected" : ""}`}
                onClick={() => selectOption(i)}
              >
                {opt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>
        {index < data.questions.length - 1 ? (
          <Button onClick={() => setIndex((i) => i + 1)}>Next</Button>
        ) : (
          <Button loading={submitting} onClick={() => submit(false)}>
            Submit assessment
          </Button>
        )}
      </div>
    </CandidateAppShell>
  );
}
