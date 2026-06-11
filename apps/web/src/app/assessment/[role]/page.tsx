"use client";

import { useCallback, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Alert, Spinner } from "@productpath/ui";
import { api, ApiError, type MvpAssessmentSessionResponse, type MvpQuestionView } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { QuestionCard } from "@/components/assessment/question-card";

export default function RoleAssessmentPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | null>(null);

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("difficulty");
    setDifficulty(d === "intermediate" ? "intermediate" : "beginner");
  }, []);

  const [data, setData] = useState<MvpAssessmentSessionResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!difficulty) return;
    const session = await api.startMvpAssessment({ roleSlug: role, difficulty });
    setData(session);
    setIndex(session.session.currentIndex);
  }, [role, difficulty]);

  useEffect(() => {
    if (difficulty === null) return;
    setLoading(true);
    load()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to start");
      })
      .finally(() => setLoading(false));
  }, [load, router, difficulty]);

  const question: MvpQuestionView | undefined = data?.questions[index];

  useEffect(() => {
    setSelectedIndex(null);
    setTextAnswer("");
  }, [index, question?.id]);

  async function saveAndNext() {
    if (!data || !question) return;
    setBusy(true);
    setError(null);
    try {
      const body =
        question.type === "short-answer"
          ? { questionId: question.id, textAnswer, currentIndex: index }
          : { questionId: question.id, selectedIndex: selectedIndex ?? undefined, currentIndex: index };

      const updated = await api.submitMvpAssessmentResponse(data.session.id, body);
      setData(updated);

      if (index + 1 >= updated.questions.length) {
        const result = await api.submitMvpAssessment(updated.session.id);
        router.push(`/results/${updated.session.id}`);
        return;
      }
      setIndex(index + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const canContinue =
    question?.type === "short-answer"
      ? textAnswer.trim().length >= 10
      : selectedIndex !== null;

  if (loading) {
    return (
      <CandidateAppShell title="Assessment">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (!data || !question) {
    return (
      <CandidateAppShell title="Assessment">
        <Alert variant="error">{error ?? "No questions available"}</Alert>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Assessment">
      <div className="pp-mvp-assess">
        <p style={{ marginBottom: 16 }}>
          <Link href="/assessment">← All roles</Link>
        </p>

        <AssessmentProgress
          current={index}
          total={data.questions.length}
          label={data.session.roleName}
        />

        {error ? (
          <div style={{ margin: "16px 0" }}>
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <QuestionCard
          question={question}
          selectedIndex={selectedIndex}
          textAnswer={textAnswer}
          onSelectIndex={setSelectedIndex}
          onTextChange={setTextAnswer}
        />

        <div className="pp-mvp-assess-actions">
          <Button disabled={!canContinue || busy} loading={busy} onClick={saveAndNext}>
            {index + 1 >= data.questions.length ? "Submit assessment" : "Next question"}
          </Button>
        </div>
      </div>
    </CandidateAppShell>
  );
}
