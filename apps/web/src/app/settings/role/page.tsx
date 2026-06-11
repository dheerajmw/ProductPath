"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Spinner } from "@productpath/ui";
import { api, ApiError, type ProductRole } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { RolePicker } from "@/components/role-picker";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuth } from "@/lib/auth-context";

export default function ChangeRoleSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth({ loginSource: "settings/role" });
  const { refresh } = useAuth();
  const [roles, setRoles] = useState<ProductRole[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmRoleId, setConfirmRoleId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const roleId = user.candidateProfile?.activeRoleId ?? null;
    if (!roleId) {
      router.replace("/onboarding/role");
      return;
    }

    setActiveRoleId(roleId);
  }, [authLoading, user, router]);

  useEffect(() => {
    api
      .roles()
      .then(({ roles: r }) => setRoles(r))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load roles");
      })
      .finally(() => setPageLoading(false));
  }, []);

  async function selectRole(roleId: string, confirmArchive = false) {
    setSubmitting(roleId);
    setError(null);
    try {
      await api.selectRole(roleId, confirmArchive);
      await refresh({ force: true });
      router.refresh();
      router.push("/settings/account");
    } catch (err) {
      if (err instanceof ApiError && err.code === "ROLE_SWITCH_REQUIRES_CONFIRM") {
        setConfirmRoleId(roleId);
      } else {
        setError(err instanceof ApiError ? err.message : "Could not change role");
      }
    } finally {
      setSubmitting(null);
    }
  }

  function handleRoleSelect(roleId: string) {
    if (activeRoleId === roleId) {
      router.push("/settings/account");
      return;
    }
    if (activeRoleId) {
      setConfirmRoleId(roleId);
      return;
    }
    void selectRole(roleId);
  }

  if (authLoading || pageLoading) {
    return (
      <CandidateAppShell title="Change product role">
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size={32} />
        </div>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Change product role">
      <p style={{ margin: "0 0 20px" }}>
        <Link href="/settings/account" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
          ← Back to my account
        </Link>
      </p>

      <header style={{ marginBottom: 24, maxWidth: 640 }}>
        <h2 className="pp-section-title" style={{ margin: "0 0 8px" }}>
          Change product role
        </h2>
        <p className="pp-body-muted" style={{ margin: 0, lineHeight: 1.55 }}>
          Your project submissions, assessments, and verification path follow one active role.
          Switching archives progress for your current role and resets the path for the new one.
        </p>
      </header>

      <div style={{ marginBottom: 20, maxWidth: 720 }}>
        <Alert variant="info">
          Optional learning roadmaps, project templates, and skill assessments are scoped to your
          active role.
        </Alert>
      </div>

      <RolePicker
        roles={roles}
        activeRoleId={activeRoleId}
        submitting={submitting}
        confirmRoleId={confirmRoleId}
        error={error}
        onSelect={handleRoleSelect}
        onConfirmSwitch={() => confirmRoleId && void selectRole(confirmRoleId, true)}
        onCancelSwitch={() => setConfirmRoleId(null)}
      />
    </CandidateAppShell>
  );
}
