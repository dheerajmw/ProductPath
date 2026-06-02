"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout, Card, CardContent, CardTitle, Button, Alert, Spinner, EmptyState } from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

type ModReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { email: string };
  post: {
    id: string;
    body: string;
    type: string;
    status: string;
    authorDisplay: string;
  } | null;
  targetPreview: string | null;
};

export default function ModerationPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ModReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    return adminApi.listModerationReports().then((res) => setReports(res.reports));
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

  async function act(reportId: string, action: "hide_post" | "dismiss") {
    setActing(reportId);
    try {
      await adminApi.resolveReport(reportId, action);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
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
          <strong>Moderation queue</strong>
          <Link href="/dashboard">← Dashboard</Link>
        </div>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <CardTitle>Pending reports</CardTitle>
          {reports.length === 0 ? (
            <EmptyState title="Queue is empty" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
              {reports.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: 16,
                    border: "1px solid var(--pp-border)",
                    borderRadius: 8,
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--pp-muted)" }}>
                    {r.targetType} · reported by {r.reporter.email} ·{" "}
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p style={{ margin: "8px 0", fontWeight: 600 }}>Reason</p>
                  <p style={{ margin: "0 0 12px", whiteSpace: "pre-wrap" }}>{r.reason}</p>
                  {r.post ? (
                    <>
                      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
                        Post by {r.post.authorDisplay}
                      </p>
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.post.body}</p>
                    </>
                  ) : r.targetPreview ? (
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.targetPreview}</p>
                  ) : null}
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <Button
                      size="sm"
                      disabled={acting === r.id}
                      onClick={() => act(r.id, "hide_post")}
                    >
                      Hide post
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={acting === r.id}
                      onClick={() => act(r.id, "dismiss")}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
