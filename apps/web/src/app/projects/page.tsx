"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  Alert,
  Button,
  Spinner,
  EmptyState,
  ListCard,
  ListCardGrid,
} from "@productpath/ui";
import { api, ApiError, type ProjectTemplateCard } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

function statusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase();
}

export default function ProjectsHubPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const activeRoleId = user?.candidateProfile?.activeRoleId ?? null;
  const [templates, setTemplates] = useState<ProjectTemplateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!activeRoleId) {
      router.replace("/onboarding/role");
      return;
    }

    setLoading(true);
    setError(null);
    api
      .getProjectTemplates()
      .then((res) => setTemplates(res.templates))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else if (err instanceof ApiError && err.code === "NO_ACTIVE_ROLE") {
          router.replace("/onboarding/role");
        } else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router, authLoading, activeRoleId]);

  if (loading) {
    return (
      <CandidateAppShell title="Project submissions">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Project submissions">
      <Card>
        <CardContent>
          <CardTitle>Project submissions</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>
            This is your main proof-of-work path. Submit projects for your active role — approved
            work counts toward interview-ready verification.
          </p>
        </CardContent>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Alert variant="info">
          Roadmaps are optional prep before the skill assessment.{" "}
          <Link href="/learn" style={{ fontWeight: 600 }}>
            Prepare to learn
          </Link>{" "}
          if you want structured modules first.
        </Alert>
      </div>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      {templates.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <EmptyState title="No projects yet" description="Templates will appear after seeding." />
        </div>
      ) : (
        <ListCardGrid style={{ marginTop: 24 }}>
          {templates.map((t) => (
            <ListCard
              key={t.id}
              icon={<span className="material-symbols-outlined">folder_special</span>}
              title={t.title}
              description={
                <>
                  {t.description ? `${t.description} · ` : null}
                  {t.latestSubmission
                    ? `Latest v${t.latestSubmission.version} — ${statusLabel(t.latestSubmission.status)}`
                    : "No submission yet"}
                </>
              }
              action={
                t.latestSubmission?.status === "DRAFT" ? (
                  <Link href={`/projects/submissions/${t.latestSubmission.id}`}>
                    <Button size="sm">Continue draft</Button>
                  </Link>
                ) : t.latestSubmission &&
                  ["UNDER_REVIEW", "SUBMITTED", "APPROVED", "REJECTED"].includes(
                    t.latestSubmission.status,
                  ) ? (
                  <Link href={`/projects/submissions/${t.latestSubmission.id}`}>
                    <Button size="sm" variant="secondary">
                      View submission
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/projects/${t.slug}`}>
                    <Button size="sm">Start project</Button>
                  </Link>
                )
              }
            />
          ))}
        </ListCardGrid>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/gaps">
          <Button variant="secondary">Skill gaps</Button>
        </Link>
      </div>
    </CandidateAppShell>
  );
}
