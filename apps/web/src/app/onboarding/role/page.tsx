"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@productpath/ui";
import { api, ApiError, type ProductRole } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { ProductPathBrand } from "@/components/productpath-brand";
import { RolePicker } from "@/components/role-picker";

export default function RoleOnboardingPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<ProductRole[]>([]);
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmRoleId, setConfirmRoleId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.me(), api.roles()])
      .then(([me, { roles: r }]) => {
        const roleId = me.user.candidateProfile?.activeRoleId ?? null;
        if (roleId) {
          router.replace("/dashboard");
          return;
        }
        setRoles(r);
        setActiveRoleId(roleId);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function selectRole(roleId: string, confirmArchive = false) {
    setSubmitting(roleId);
    setError(null);
    try {
      await api.selectRole(roleId, confirmArchive);
      router.push("/projects");
    } catch (err) {
      if (err instanceof ApiError && err.code === "ROLE_SWITCH_REQUIRES_CONFIRM") {
        setConfirmRoleId(roleId);
      } else {
        setError(err instanceof ApiError ? err.message : "Could not select role");
      }
    } finally {
      setSubmitting(null);
    }
  }

  function handleRoleSelect(roleId: string) {
    if (activeRoleId && activeRoleId !== roleId) {
      setConfirmRoleId(roleId);
      return;
    }
    void selectRole(roleId);
  }

  if (loading) {
    return (
      <CandidateAppShell title="Get started">
        <div className="pp-onboarding-loading">
          <Spinner size={32} />
        </div>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Get started">
      <section className="pp-onboarding">
        <header className="pp-onboarding-hero">
          <ProductPathBrand href="/" size="lg" />
          <span className="pp-pill pp-pill--primary pp-onboarding-step">
            <span className="pp-onboarding-step-dot" />
            Step 1 of 1
          </span>
          <h2 className="pp-onboarding-title">
            Choose your <span className="pp-gradient-text">product role</span>
          </h2>
          <p className="pp-body-muted pp-onboarding-subtitle">
            Your project submissions, assessments, and verification path are tailored to one active
            role at a time. Optional roadmaps are available if you want to learn before testing.
          </p>
        </header>

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
      </section>
    </CandidateAppShell>
  );
}
