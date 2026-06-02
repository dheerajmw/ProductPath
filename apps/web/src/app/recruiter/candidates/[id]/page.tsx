"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
  CardContent,
  CardTitle,
  Button,
  Alert,
  Spinner,
  VerificationBadge,
} from "@productpath/ui";
import { api, ApiError, type RecruiterCandidateResponse } from "@/lib/api";
import { RecruiterShell } from "@/components/recruiter-shell";

export default function RecruiterCandidatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<RecruiterCandidateResponse | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((auth) => {
        if (auth.user.platformRole !== "RECRUITER") {
          router.replace("/dashboard");
          return;
        }
        return api.getRecruiterCandidate(id);
      })
      .then((res) => res && setData(res))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function sendInterest(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.sendInterest(id, message);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send interest");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <RecruiterShell title="Talent search">
        <Spinner size={32} />
      </RecruiterShell>
    );
  }

  if (!data) {
    return (
      <RecruiterShell title="Talent search">
        <Alert variant="error">{error ?? "Candidate not found"}</Alert>
      </RecruiterShell>
    );
  }

  const c = data.candidate;

  return (
    <RecruiterShell title="Talent search">
      <Card>
        <CardContent>
          <CardTitle>{c.displayName ?? "Candidate"}</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>{c.role.name}</p>
          {c.verification.state ? (
            <div style={{ marginTop: 12 }}>
              <VerificationBadge
                state={c.verification.state as "INTERVIEW_READY" | "VERIFIED_PROFESSIONAL"}
                validUntil={c.verification.validUntil}
              />
            </div>
          ) : null}
          <ul style={{ marginTop: 16, paddingLeft: 20, fontSize: "0.9375rem" }}>
            <li>
              Latest assessment:{" "}
              {c.evidence.latestAssessmentScore != null
                ? `${Math.round(c.evidence.latestAssessmentScore)}% (${c.evidence.passed ? "passed" : "not passing"})`
                : "—"}
            </li>
            <li>Approved projects: {c.evidence.approvedProjects}</li>
          </ul>
        </CardContent>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <CardContent>
          <CardTitle>Send interest</CardTitle>
          {c.hasPendingInterest || sent ? (
            <div style={{ marginTop: 12 }}>
              <Alert variant="info">
                {sent
                  ? "Interest sent. The candidate can accept or decline."
                  : "You already have a pending request."}
              </Alert>
            </div>
          ) : (
            <form onSubmit={sendInterest} style={{ marginTop: 12 }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce your role and why you're reaching out (min 20 characters)…"
                rows={5}
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--pp-border)" }}
                required
                minLength={20}
              />
              {error ? (
                <p style={{ color: "var(--pp-error)", fontSize: "0.875rem", marginTop: 8 }}>{error}</p>
              ) : null}
              <Button type="submit" disabled={sending || message.length < 20} style={{ marginTop: 12 }}>
                {sending ? "Sending…" : "Send interest request"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </RecruiterShell>
  );
}
