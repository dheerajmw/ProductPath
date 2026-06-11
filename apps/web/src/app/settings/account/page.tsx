"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  Alert,
  Spinner,
  Button,
  VerificationBadge,
} from "@productpath/ui";
import { api } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { AuthLoadingScreen } from "@/components/auth-guard";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth({ loginSource: "settings/account" });
  const [verificationState, setVerificationState] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);

  const activeRoleId = user?.candidateProfile?.activeRoleId ?? null;
  const displayName =
    user?.candidateProfile?.displayName?.trim() || user?.email.split("@")[0] || "Member";
  const roleName = user?.candidateProfile?.activeRole?.name ?? null;
  const emailVerified = user?.emailVerified ?? false;

  useEffect(() => {
    if (authLoading || !user) return;

    if (!activeRoleId) {
      router.replace("/onboarding/role");
      return;
    }

    setVerificationLoading(true);
    api
      .getVerification()
      .then((verification) => setVerificationState(verification.state))
      .catch(() => setVerificationState(null))
      .finally(() => setVerificationLoading(false));
  }, [authLoading, user, activeRoleId, router]);

  if (authLoading || !user) {
    return (
      <CandidateAppShell title="My account">
        <AuthLoadingScreen label="Loading account…" />
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="My account">
      <Card>
        <CardContent>
          <CardTitle>{displayName}</CardTitle>
          <p
            className="pp-account-email"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "10px 0 0",
              fontSize: "0.9375rem",
              color: "var(--pp-muted)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: "var(--pp-primary)", flexShrink: 0 }}
              aria-hidden
            >
              mail
            </span>
            <span>
              <span style={{ color: "var(--pp-fg)", fontWeight: 500 }}>Email </span>
              {user.email}
            </span>
          </p>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {roleName ? (
              <span className="pp-pill pp-pill--primary">{roleName}</span>
            ) : null}
            {emailVerified ? (
              <span className="pp-pill pp-pill--success">Email verified</span>
            ) : (
              <span className="pp-pill pp-pill--primary">Email not verified</span>
            )}
          </div>
          {!emailVerified ? (
            <div style={{ marginTop: 16 }}>
              <Alert variant="info">
                Verify your email from the link in your inbox, or use the dev link on the{" "}
                <Link href="/verify-email/pending">verification pending</Link> page.
              </Alert>
            </div>
          ) : null}
          {verificationLoading ? (
            <div style={{ marginTop: 16 }}>
              <Spinner size={20} />
            </div>
          ) : verificationState ? (
            <div style={{ marginTop: 16 }}>
              <VerificationBadge
                state={
                  verificationState as
                    | "LEARNING"
                    | "EMERGING_TALENT"
                    | "INTERVIEW_READY"
                    | "VERIFIED_PROFESSIONAL"
                }
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <CardContent>
          <CardTitle style={{ fontSize: "1.125rem" }}>Manage</CardTitle>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <Link href="/profile">
              <Button variant="secondary" size="sm">
                Verification & checklist
              </Button>
            </Link>
            <Link href="/settings/role">
              <Button variant="secondary" size="sm">
                Change product role
              </Button>
            </Link>
            <Link href="/settings/discovery">
              <Button variant="secondary" size="sm">
                Recruiter discovery
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Command Center
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </CandidateAppShell>
  );
}
