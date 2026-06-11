"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Spinner, Button } from "@productpath/ui";
import { CandidateAppShell } from "@/components/app-shell";
import { RoleResourceLibrary } from "@/components/learning/role-resource-library";
import { getCurriculumForRole } from "@/data/learning/curriculum";
import { useAuth } from "@/lib/auth-context";

export default function ResourceLibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const activeRoleSlug = user?.candidateProfile?.activeRole?.slug;
  const curriculum = activeRoleSlug ? getCurriculumForRole(activeRoleSlug) : undefined;

  useEffect(() => {
    if (authLoading) return;
    if (!user?.candidateProfile?.activeRoleId) {
      router.push("/onboarding/role");
    }
  }, [authLoading, router, user?.candidateProfile?.activeRoleId]);

  if (authLoading) {
    return (
      <CandidateAppShell title="Resource library">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (curriculum) {
    return (
      <CandidateAppShell title="Resource library">
        <RoleResourceLibrary curriculum={curriculum} />
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Resource library">
      <Alert variant="info">
        A detailed resource library is available for Product Marketing. Switch your active role or
        browse the public career roadmap for your current role.
      </Alert>
      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={activeRoleSlug ? `/roadmaps/ai-${activeRoleSlug}` : "/roadmaps"}>
          <Button>View career roadmap</Button>
        </Link>
        <Link href="/settings/role">
          <Button variant="secondary">Change role</Button>
        </Link>
      </div>
    </CandidateAppShell>
  );
}
