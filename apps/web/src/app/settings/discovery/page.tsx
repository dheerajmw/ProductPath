"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle, Alert, Button, Spinner } from "@productpath/ui";
import { api, ApiError, type DiscoverySettingsResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function DiscoverySettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<DiscoverySettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .me()
      .then((me) => {
        if (me.user.platformRole !== "CANDIDATE") {
          router.replace("/dashboard");
          return;
        }
        if (!me.user.candidateProfile?.activeRoleId) {
          router.replace("/onboarding/role");
          return;
        }
        return api.getDiscoverySettings();
      })
      .then((res) => res && setData(res))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function toggle() {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const next = await api.updateDiscovery(!data.discoverable);
      setData(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Discovery">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (!data) {
    return (
      <CandidateAppShell title="Discovery">
        <Alert variant="error">{error ?? "Unable to load settings"}</Alert>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Discovery">
      <Card>
        <CardContent>
          <CardTitle>Recruiter discovery</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>
            When enabled, verified recruiters can find your profile in talent search after you reach
            interview ready status. Contact details are only shared when you accept an interest
            request.
          </p>
          {!data.eligible ? (
            <div style={{ marginTop: 16 }}>
            <Alert variant="info">
              You need interview ready verification before opting in.{" "}
              <Link href="/profile">View verification checklist</Link>
            </Alert>
            </div>
          ) : null}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <Button onClick={toggle} disabled={!data.eligible || saving}>
              {data.discoverable ? "Turn off discovery" : "Make profile discoverable"}
            </Button>
            <span style={{ fontSize: "0.875rem" }}>
              Status: <strong>{data.discoverable ? "Discoverable" : "Hidden"}</strong>
            </span>
          </div>
          {error ? (
            <p style={{ color: "var(--pp-error)", marginTop: 12, fontSize: "0.875rem" }}>{error}</p>
          ) : null}
        </CardContent>
      </Card>
    </CandidateAppShell>
  );
}
