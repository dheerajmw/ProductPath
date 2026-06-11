"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Spinner, Button } from "@productpath/ui";
import { api, ApiError, type MvpAssessmentResultResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { ResultCard } from "@/components/results/result-card";

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<MvpAssessmentResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMvpAssessmentResult(sessionId)
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load results");
      })
      .finally(() => setLoading(false));
  }, [sessionId, router]);

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
      <div className="pp-mvp-results-page">
        <p style={{ marginBottom: 16 }}>
          <Link href="/assessment">← Take another assessment</Link>
        </p>
        <ResultCard data={data.result} />
        <div style={{ marginTop: 24 }}>
          <Link href="/gaps">
            <Button variant="secondary">View learning gaps</Button>
          </Link>
        </div>
      </div>
    </CandidateAppShell>
  );
}
