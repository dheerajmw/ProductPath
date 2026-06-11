"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Spinner, Button } from "@productpath/ui";
import { api, ApiError, type RoadmapResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { RoleRoadmapOs } from "@/components/roadmap";
import { useAuth } from "@/lib/auth-context";

function careerRoadmapHref(roleSlug: string | undefined) {
  return roleSlug ? `/roadmaps/ai-${roleSlug}` : "/roadmaps";
}

export default function RoleRoadmapsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const activeRoleId = user?.candidateProfile?.activeRoleId ?? null;
  const activeRoleSlug = user?.candidateProfile?.activeRole?.slug;
  const [data, setData] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!activeRoleId) {
      router.push("/onboarding/role");
      return;
    }

    setLoading(true);
    setData(null);
    setError(null);
    api
      .getRoadmap()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 401) router.push("/login");
          else if (err.code === "NO_ACTIVE_ROLE") router.push("/onboarding/role");
          else if (err.code === "ROADMAP_NOT_FOUND") {
            setError("ROADMAP_NOT_FOUND");
          } else setError(err.message);
        } else setError("Failed to load roadmap");
      })
      .finally(() => setLoading(false));
  }, [router, authLoading, activeRoleId]);

  if (loading) {
    return (
      <CandidateAppShell title="Roadmaps">
        <div className="pp-role-roadmap-os-loading">
          <Spinner size={32} />
        </div>
      </CandidateAppShell>
    );
  }

  if (error) {
    return (
      <CandidateAppShell title="Roadmaps">
        {error === "ROADMAP_NOT_FOUND" ? (
          <>
            <Alert variant="info">
              No interactive modules are published for your active role yet. Browse the AI career
              roadmap for structured guidance in the meantime.
            </Alert>
            <Link href={careerRoadmapHref(activeRoleSlug)} style={{ marginTop: 16, display: "inline-block" }}>
              <Button>View AI career roadmap</Button>
            </Link>
            <Link href="/roadmaps" style={{ marginTop: 12, display: "inline-block", marginLeft: 12 }}>
              <Button variant="secondary">All career roadmaps</Button>
            </Link>
          </>
        ) : (
          <Alert variant="error">{error}</Alert>
        )}
      </CandidateAppShell>
    );
  }

  if (!data) return null;

  return (
    <CandidateAppShell title="Roadmaps">
      <RoleRoadmapOs data={data} />
    </CandidateAppShell>
  );
}
