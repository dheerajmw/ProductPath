"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Card,
  CardContent,
  CardTitle,
  Alert,
  Button,
  Spinner,
  Input,
  EmptyState,
} from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type QueueItem = {
  id: string;
  version: number;
  title: string | null;
  submittedAt: string | null;
  template: { slug: string; title: string };
  candidate: { email: string; displayName: string | null };
  rubric: { criteria: { key: string; label: string; required: boolean; maxScore: number }[] };
};

type ReviewDetail = {
  submission: {
    id: string;
    title: string | null;
    narrative: string | null;
    artifacts: { type: string; name: string; url: string }[];
  };
  template: { title: string; rubric: QueueItem["rubric"] };
  candidate: { email: string; displayName: string | null };
};

async function reviewerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Failed", res.status);
  return data as T;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadQueue() {
    return reviewerFetch<{ queue: QueueItem[] }>("/reviewer/queue").then((res) => setQueue(res.queue));
  }

  useEffect(() => {
    adminApi
      .me()
      .then((me) => {
        if (!["ADMIN", "REVIEWER"].includes(me.user.platformRole)) {
          throw new ApiError("Forbidden", 403);
        }
        return loadQueue();
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    reviewerFetch<ReviewDetail>(`/reviewer/submissions/${selectedId}`)
      .then((res) => {
        setDetail(res);
        const initial: Record<string, number> = {};
        for (const c of res.template.rubric.criteria) initial[c.key] = 3;
        setScores(initial);
        setFeedback("");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load submission"));
  }, [selectedId]);

  async function submitReview(decision: "APPROVED" | "REJECTED") {
    if (!selectedId) return;
    setSubmitting(true);
    setError(null);
    try {
      await reviewerFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          submissionId: selectedId,
          decision,
          feedback,
          rubricScores: scores,
        }),
      });
      setSelectedId(null);
      await loadQueue();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Review failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <Spinner size={32} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}>
            ← Admin · Reviews
          </Link>
        </div>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, marginTop: 16 }}>
        <Card>
          <CardContent>
            <CardTitle>Queue ({queue.length})</CardTitle>
            {queue.length === 0 ? (
              <EmptyState title="No pending reviews" />
            ) : (
              <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
                {queue.map((item) => (
                  <li key={item.id} style={{ marginBottom: 8 }}>
                    <Button
                      variant={selectedId === item.id ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setSelectedId(item.id)}
                      style={{ width: "100%", textAlign: "left" }}
                    >
                      {item.template.title} v{item.version}
                    </Button>
                    <p style={{ fontSize: "0.75rem", color: "var(--pp-muted)", margin: "4px 0 0" }}>
                      {item.candidate.displayName ?? item.candidate.email}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div>
          {!detail ? (
            <EmptyState title="Select a submission" description="Choose an item from the queue to review." />
          ) : (
            <Card>
              <CardContent>
                <CardTitle>{detail.submission.title ?? detail.template.title}</CardTitle>
                <p style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--pp-muted)" }}>
                  {detail.candidate.displayName ?? detail.candidate.email}
                </p>
                <pre
                  style={{
                    marginTop: 16,
                    whiteSpace: "pre-wrap",
                    fontSize: "0.875rem",
                    background: "#f8f8f8",
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  {detail.submission.narrative || "(No narrative)"}
                </pre>
                {detail.submission.artifacts.length > 0 ? (
                  <ul style={{ marginTop: 12 }}>
                    {detail.submission.artifacts.map((a, i) => (
                      <li key={i}>
                        <a href={a.url} target="_blank" rel="noreferrer">
                          {a.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div style={{ marginTop: 24 }}>
                  <CardTitle>Rubric</CardTitle>
                  {detail.template.rubric.criteria.map((c) => (
                    <div key={c.key} style={{ marginTop: 12 }}>
                      <label style={{ fontSize: "0.875rem" }}>
                        {c.label} {c.required ? "*" : ""} (0–{c.maxScore})
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={c.maxScore}
                        value={scores[c.key] ?? 0}
                        onChange={(e) =>
                          setScores((s) => ({ ...s, [c.key]: Number(e.target.value) }))
                        }
                        style={{ marginTop: 4, maxWidth: 80 }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24 }}>
                  <label style={{ fontSize: "0.875rem" }}>Feedback (min 100 chars for rejection)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={5}
                    style={{
                      width: "100%",
                      marginTop: 6,
                      padding: 10,
                      border: "1px solid var(--pp-border)",
                      borderRadius: "var(--pp-radius)",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <Button onClick={() => submitReview("APPROVED")} disabled={submitting}>
                    Approve
                  </Button>
                  <Button variant="secondary" onClick={() => submitReview("REJECTED")} disabled={submitting}>
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
