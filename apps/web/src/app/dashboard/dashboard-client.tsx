"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Alert,
  Spinner,
  VerificationBadge,
} from "@productpath/ui";
import { api, type User, ApiError, type SkillDevelopmentResponse, type VerificationResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

function ProgressRing({ percent }: { percent: number }) {
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="pp-progress-ring">
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--pp-surface-variant)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--pp-secondary)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="pp-progress-ring-label">
        <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--pp-primary)" }}>
          {percent}%
        </span>
        <span className="pp-label-caps">Learning prep</span>
      </div>
    </div>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [skillDev, setSkillDev] = useState<SkillDevelopmentResponse | null>(null);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .me()
      .then((me) => {
        setUser(me.user);
        const roleId = me.user.candidateProfile?.activeRoleId;
        if (!roleId) {
          router.replace("/onboarding/role");
          return;
        }
        return Promise.all([
          api.getSkillDevelopment().then(setSkillDev).catch(() => null),
          api.getVerification().then(setVerification).catch(() => null),
        ]);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login?role=candidate");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const displayName = user?.candidateProfile?.displayName ?? user?.email.split("@")[0] ?? "Member";

  if (loading) {
    return (
      <CandidateAppShell title="Command Center">
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size={32} />
        </div>
      </CandidateAppShell>
    );
  }

  if (error || !user) {
    return (
      <CandidateAppShell title="Command Center">
        <Alert variant="error">{error ?? "Not authenticated"}</Alert>
      </CandidateAppShell>
    );
  }

  const modulesDone = skillDev?.summary.modulesCompleted ?? 0;
  const progressPct = modulesDone ? Math.min(100, modulesDone * 12) : 0;
  const activeRole = user.candidateProfile?.activeRole;
  const openGaps = skillDev?.summary.openGaps ?? 0;
  const hasAssessment = skillDev?.summary.hasAssessment ?? false;

  return (
    <CandidateAppShell title="Command Center">
      {!user.emailVerified ? (
        <div style={{ marginBottom: 24 }}>
          <Alert variant="info">
            Please verify your email. Check your inbox or API logs in development.
          </Alert>
        </div>
      ) : null}

      {verification?.expiringSoon ? (
        <div style={{ marginBottom: 24 }}>
          <Alert variant="info">
            Verification expires in {verification.daysUntilExpiry} days.{" "}
            <Link href="/profile">View checklist</Link>
          </Alert>
        </div>
      ) : null}

      {verification?.expired ? (
        <div style={{ marginBottom: 24 }}>
          <Alert variant="error">
            Your assessment verification has expired. Retake the assessment to restore status.
          </Alert>
        </div>
      ) : null}

      <div className="pp-dashboard-grid">
        <section className="pp-glass-card pp-dashboard-hero" style={{ padding: 32, position: "relative", overflow: "hidden" }}>
          <div className="pp-accent-glow" style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%" }} />
          <div className="pp-dashboard-hero-inner" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ flex: 1 }}>
              <span className="pp-label-caps" style={{ color: "var(--pp-secondary)", display: "block", marginBottom: 8 }}>
                Command center
              </span>
              <h2 className="pp-headline-lg" style={{ fontSize: "1.75rem", margin: "0 0 12px", color: "var(--pp-primary)" }}>
                Welcome back, {displayName}.
              </h2>
              <p className="pp-body-muted" style={{ maxWidth: 480, margin: "0 0 20px" }}>
                {activeRole
                  ? `Your ${activeRole.name} proof-of-work path is in progress. Submit projects, take the skill assessment when ready, and earn verification.`
                  : "Select a product role to start submitting projects."}
              </p>
              {verification ? (
                <div style={{ marginBottom: 20 }}>
                  <VerificationBadge
                    state={
                      verification.state as
                        | "LEARNING"
                        | "EMERGING_TALENT"
                        | "INTERVIEW_READY"
                        | "VERIFIED_PROFESSIONAL"
                    }
                    validUntil={verification.expiresAt}
                  />
                </div>
              ) : null}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {activeRole ? (
                  <>
                    <Link href="/projects">
                      <Button>Submit a project</Button>
                    </Link>
                    <Link href="/assessments">
                      <Button variant="secondary">Skill assessment</Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/onboarding/role">
                    <Button>Choose your role</Button>
                  </Link>
                )}
              </div>
            </div>
            <ProgressRing percent={progressPct} />
          </div>
        </section>

        <div className="pp-dashboard-stats">
          <div className="pp-glass-card pp-stat-card">
            <span className="pp-label-caps">Skill development</span>
            <p className="pp-headline-md" style={{ margin: "8px 0 0", fontSize: "1.25rem" }}>
              {openGaps === 0 && hasAssessment
                ? "On track"
                : hasAssessment
                  ? `${openGaps} gap(s) open`
                  : "Not started"}
            </p>
            <Link href="/gaps" style={{ display: "inline-block", marginTop: 12, fontSize: "0.875rem", fontWeight: 600 }}>
              View gaps →
            </Link>
          </div>
          <div className="pp-glass-card pp-stat-card">
            <span className="pp-label-caps">Proof of work</span>
            <p className="pp-headline-md" style={{ margin: "8px 0 0", fontSize: "1.25rem" }}>
              Submissions
            </p>
            <Link href="/projects" style={{ display: "inline-block", marginTop: 12, fontSize: "0.875rem", fontWeight: 600 }}>
              Project hub →
            </Link>
          </div>
          <div className="pp-glass-card pp-stat-card">
            <span className="pp-label-caps">Optional prep</span>
            <p className="pp-headline-md" style={{ margin: "8px 0 0", fontSize: "1.25rem" }}>
              Learn first
            </p>
            <Link href="/learn" style={{ display: "inline-block", marginTop: 12, fontSize: "0.875rem", fontWeight: 600 }}>
              Prepare to learn →
            </Link>
          </div>
          <div className="pp-glass-card pp-stat-card">
            <span className="pp-label-caps">Network</span>
            <p className="pp-headline-md" style={{ margin: "8px 0 0", fontSize: "1.25rem" }}>
              Opportunities
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: "0.875rem", fontWeight: 600 }}>
              <Link href="/opportunities">Inbox →</Link>
              <Link href="/community">Community →</Link>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
          marginTop: 24,
        }}
      >
        <Link href="/projects" className="pp-glass-card" style={{ padding: 24, textDecoration: "none", color: "inherit" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--pp-primary)", fontSize: 28 }}>
            folder_special
          </span>
          <h3 className="pp-headline-md" style={{ fontSize: "1.125rem", margin: "16px 0 8px" }}>
            Project submissions
          </h3>
          <p className="pp-body-muted" style={{ margin: 0 }}>Your main proof-of-work — draft, upload, and submit projects.</p>
        </Link>
        <Link href="/learn" className="pp-glass-card" style={{ padding: 24, textDecoration: "none", color: "inherit" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--pp-primary-fixed-dim)", fontSize: 28 }}>
            school
          </span>
          <h3 className="pp-headline-md" style={{ fontSize: "1.125rem", margin: "16px 0 8px" }}>
            Prepare to learn
          </h3>
          <p className="pp-body-muted" style={{ margin: 0 }}>Optional roadmaps before your skill assessment.</p>
        </Link>
        <Link href="/assessments" className="pp-glass-card" style={{ padding: 24, textDecoration: "none", color: "inherit" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--pp-secondary)", fontSize: 28 }}>
            quiz
          </span>
          <h3 className="pp-headline-md" style={{ fontSize: "1.125rem", margin: "16px 0 8px" }}>
            Assessments
          </h3>
          <p className="pp-body-muted" style={{ margin: 0 }}>Objective scoring with verification freshness.</p>
        </Link>
        <Link href="/profile" className="pp-glass-card" style={{ padding: 24, textDecoration: "none", color: "inherit" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--pp-primary-fixed-dim)", fontSize: 28 }}>
            verified
          </span>
          <h3 className="pp-headline-md" style={{ fontSize: "1.125rem", margin: "16px 0 8px" }}>
            Verification
          </h3>
          <p className="pp-body-muted" style={{ margin: 0 }}>Checklist, badge status, and public profile.</p>
        </Link>
      </div>
    </CandidateAppShell>
  );
}
