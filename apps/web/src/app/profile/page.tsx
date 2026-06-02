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
  VerificationBadge,
  ListCard,
  ListCardGrid,
} from "@productpath/ui";
import { api, ApiError, type VerificationResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .me()
      .then((me) => {
        if (!me.user.candidateProfile?.activeRoleId) {
          router.replace("/onboarding/role");
          return;
        }
        return api.getVerification();
      })
      .then((res) => res && setData(res))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <CandidateAppShell title="Verification">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (!data) {
    return (
      <CandidateAppShell title="Verification">
        <Alert variant="error">{error ?? "Unable to load profile"}</Alert>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Verification">
      <Card>
        <CardContent>
          <CardTitle>Verification profile</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>
            Active path: <strong>{data.role.name}</strong>
          </p>
          <div style={{ marginTop: 16 }}>
            <VerificationBadge
              state={data.state as "LEARNING" | "EMERGING_TALENT" | "INTERVIEW_READY" | "VERIFIED_PROFESSIONAL"}
              validUntil={data.expiresAt}
            />
          </div>
          {data.discoveryEligible ? (
            <p style={{ marginTop: 12, fontSize: "0.875rem" }}>
              {data.discoverable ? (
                <span style={{ color: "var(--pp-secondary)" }}>Visible to recruiters in talent search.</span>
              ) : (
                <>
                  Interview ready —{" "}
                  <Link href="/settings/discovery">enable discovery</Link> to appear in search.
                </>
              )}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {data.expiringSoon ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="info">
            Your assessment verification expires in {data.daysUntilExpiry} days. Retake the assessment
            to stay interview ready.
          </Alert>
          <Link href="/assessments">
            <Button style={{ marginTop: 12 }}>Retake assessment</Button>
          </Link>
        </div>
      ) : null}

      {data.expired ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="error">
            Your passing assessment has expired. Complete a fresh assessment to restore interview
            ready status.
          </Alert>
        </div>
      ) : null}

      <Card style={{ marginTop: 24 }}>
        <CardContent>
          <CardTitle>Requirements checklist</CardTitle>
          <ListCardGrid style={{ marginTop: 16 }}>
            {data.checklist.map((item) => (
              <ListCard
                key={item.key}
                status={item.met ? "success" : "default"}
                icon={
                  <span className="material-symbols-outlined">
                    {item.met ? "check_circle" : "radio_button_unchecked"}
                  </span>
                }
                title={item.label}
                description={item.detail}
                action={
                  <span
                    className={`pp-pill ${item.met ? "pp-pill--success" : "pp-pill--primary"}`}
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {item.met ? "Met" : "Not met"}
                  </span>
                }
              />
            ))}
          </ListCardGrid>
        </CardContent>
      </Card>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/assessments">
          <Button variant="secondary">Assessments</Button>
        </Link>
        <Link href="/projects">
          <Button variant="secondary">Projects</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost">Dashboard</Button>
        </Link>
      </div>
    </CandidateAppShell>
  );
}
