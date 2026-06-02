"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout, Card, CardContent, CardTitle, Button, Alert, Spinner, EmptyState } from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

type PendingRecruiter = {
  id: string;
  userId: string;
  company: string | null;
  companyDomain: string | null;
  user: { id: string; email: string; createdAt: string; emailVerifiedAt: string | null };
};

export default function AdminRecruitersPage() {
  const router = useRouter();
  const [recruiters, setRecruiters] = useState<PendingRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    return adminApi.listPendingRecruiters().then((res) => setRecruiters(res.recruiters));
  }

  useEffect(() => {
    adminApi
      .me()
      .then((me) => {
        if (me.user.platformRole !== "ADMIN") throw new ApiError("Forbidden", 403);
        return load();
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function verify(userId: string) {
    setActing(userId);
    try {
      await adminApi.verifyRecruiter(userId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verify failed");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <Spinner size={32} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Recruiter verification</strong>
          <Link href="/dashboard">← Dashboard</Link>
        </div>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <CardTitle>Pending recruiters</CardTitle>
          {recruiters.length === 0 ? (
            <EmptyState title="No pending recruiters" />
          ) : (
            <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--pp-border)" }}>
                  <th style={{ padding: 8 }}>Email</th>
                  <th style={{ padding: 8 }}>Company</th>
                  <th style={{ padding: 8 }}>Domain</th>
                  <th style={{ padding: 8 }} />
                </tr>
              </thead>
              <tbody>
                {recruiters.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--pp-border)" }}>
                    <td style={{ padding: 8 }}>{r.user.email}</td>
                    <td style={{ padding: 8 }}>{r.company ?? "—"}</td>
                    <td style={{ padding: 8 }}>{r.companyDomain ?? "—"}</td>
                    <td style={{ padding: 8 }}>
                      <Button size="sm" disabled={acting === r.userId} onClick={() => verify(r.userId)}>
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
