"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  Alert,
  Spinner,
  EmptyState,
  Button,
  ListCard,
  ListCardGrid,
  ProgressBar,
} from "@productpath/ui";
import { api, ApiError, type RoadmapResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

function statusLabel(status: string) {
  switch (status) {
    case "COMPLETED":
      return "Complete";
    case "IN_PROGRESS":
      return "In progress";
    default:
      return "Not started";
  }
}

function moduleStatus(mod: RoadmapResponse["modules"][0]) {
  if (mod.locked) return "locked" as const;
  if (mod.status === "COMPLETED") return "completed" as const;
  if (mod.status === "IN_PROGRESS") return "active" as const;
  return "default" as const;
}

function moduleIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return "check_circle";
    case "IN_PROGRESS":
      return "play_circle";
    case "locked":
      return "lock";
    default:
      return "radio_button_unchecked";
  }
}

export default function LearnPage() {
  const router = useRouter();
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getRoadmap()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 401) router.push("/login");
          else if (err.code === "NO_ACTIVE_ROLE") router.push("/onboarding/role");
          else setError(err.message);
        } else setError("Failed to load roadmap");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <CandidateAppShell title="My Roadmaps">
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size={32} />
        </div>
      </CandidateAppShell>
    );
  }

  if (error) {
    return (
      <CandidateAppShell title="My Roadmaps">
        <Alert variant="error">{error}</Alert>
      </CandidateAppShell>
    );
  }

  if (!data) return null;

  return (
    <CandidateAppShell title="My Roadmaps">
      <Card>
        <CardContent>
          <CardTitle>{data.roadmap.title}</CardTitle>
          <CardDescription>
            {data.role.name} · {data.roadmap.description}
          </CardDescription>
          <div style={{ marginTop: 20 }}>
            <ProgressBar
              value={data.progress.percent}
              label={data.progress.label}
              trailing={
                <>
                  {data.progress.percent}% ({data.progress.completedModules}/
                  {data.progress.totalModules} modules)
                </>
              }
              hint="Learning progress only — not hiring readiness or interview-ready status."
            />
          </div>
        </CardContent>
      </Card>

      <section style={{ marginTop: 28 }}>
        <h2 className="pp-section-title">Modules</h2>
        {data.modules.length === 0 ? (
          <EmptyState title="No modules yet" description="Content will appear here once published." />
        ) : (
          <ListCardGrid>
            {data.modules.map((mod) => {
              const status = moduleStatus(mod);
              return (
                <ListCard
                  key={mod.id}
                  status={status}
                  icon={<span className="material-symbols-outlined">{moduleIcon(status)}</span>}
                  title={mod.title}
                  description={`${statusLabel(mod.status)} · ${mod.requiredResourcesCompleted}/${mod.requiredResourcesTotal} required resources`}
                  hint={
                    mod.locked
                      ? `Complete: ${mod.prerequisites.map((p) => p.title).join(", ")}`
                      : undefined
                  }
                  action={
                    mod.locked ? (
                      <Button size="sm" variant="secondary" disabled>
                        Locked
                      </Button>
                    ) : (
                      <Link href={`/learn/${mod.id}`}>
                        <Button
                          size="sm"
                          variant={mod.status === "COMPLETED" ? "secondary" : "primary"}
                        >
                          {mod.status === "COMPLETED" ? "Review" : "Start"}
                        </Button>
                      </Link>
                    )
                  }
                />
              );
            })}
          </ListCardGrid>
        )}
      </section>
    </CandidateAppShell>
  );
}
