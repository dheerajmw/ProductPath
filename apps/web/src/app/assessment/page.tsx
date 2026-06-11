"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardTitle, Spinner, Alert } from "@productpath/ui";
import { api, ApiError, type MvpAssessmentRole } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function AssessmentHubPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<MvpAssessmentRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMvpAssessmentRoles()
      .then((res) => setRoles(res.roles))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <CandidateAppShell title="Skill assessment">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Skill assessment">
      <div className="pp-mvp-hub">
        <header className="pp-mvp-hub-header">
          <p className="pp-label-caps">MVP · AI-powered</p>
          <h1>Role skill assessments</h1>
          <p>Lightweight assessments across 5 product roles. MCQ, scenarios, and short answers with optional AI feedback.</p>
        </header>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="pp-mvp-role-grid">
          {roles.map((role) => (
            <Card key={role.slug}>
              <CardContent>
                <CardTitle>{role.name}</CardTitle>
                <p style={{ color: "var(--pp-muted)", marginTop: 8, fontSize: "0.875rem" }}>
                  Beginner & intermediate · ~8 questions
                </p>
                <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href={`/assessment/${role.slug}?difficulty=beginner`}>
                    <Button size="sm">Beginner</Button>
                  </Link>
                  <Link href={`/assessment/${role.slug}?difficulty=intermediate`}>
                    <Button size="sm" variant="secondary">
                      Intermediate
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="pp-mvp-hub-note">
          Legacy timed MCQ assessments remain at{" "}
          <Link href="/assessments">/assessments</Link> (PM only).
        </p>
      </div>
    </CandidateAppShell>
  );
}
