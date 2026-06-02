"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout, Card, CardContent, CardTitle, Button, Alert, Spinner, EmptyState } from "@productpath/ui";
import { adminApi, ApiError, type AuditLog } from "@/lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [flags, setFlags] = useState<{ key: string; enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((me) => {
        if (me.user.platformRole !== "ADMIN") {
          throw new ApiError("Forbidden", 403);
        }
        return Promise.all([adminApi.dashboard(), adminApi.auditLogs(), adminApi.featureFlags()]);
      })
      .then(([dash, audit, ff]) => {
        setStats(dash.stats);
        setLogs(audit.logs);
        setFlags(ff.flags);
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

  async function logout() {
    await adminApi.logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <PageLayout>
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size={32} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="pp-headline-md" style={{ fontSize: "1.125rem" }}>
            ProductPath Admin
          </span>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key}>
              <CardContent>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--pp-muted)", textTransform: "uppercase" }}>
                  {key}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "1.5rem", fontWeight: 700 }}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No stats" />
      )}

      <div style={{ marginTop: 24 }}>
        <Card>
          <CardContent>
            <CardTitle>Quick links</CardTitle>
            <p style={{ marginTop: 12 }}>
              <Link href="/content/roadmaps">Manage learning roadmaps →</Link>
            </p>
            <p style={{ marginTop: 8 }}>
              <Link href="/content/questions">Question bank →</Link>
            </p>
            <p style={{ marginTop: 8 }}>
              <Link href="/content/skill-mappings">Skill → module mappings →</Link>
            </p>
            <p style={{ marginTop: 8 }}>
              <Link href="/content/project-templates">Project templates →</Link>
            </p>
            <p style={{ marginTop: 8 }}>
              <Link href="/reviews">Review queue →</Link>
            </p>
            <p style={{ marginTop: 8 }}>
              <Link href="/recruiters">Recruiter verification →</Link>
            </p>
            <p style={{ marginTop: 8 }}>
              <Link href="/moderation">Moderation queue →</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card>
          <CardContent>
            <CardTitle>Feature flags</CardTitle>
            <ul style={{ paddingLeft: 20 }}>
              {flags.map((f) => (
                <li key={f.key}>
                  <code>{f.key}</code> — {f.enabled ? "enabled" : "disabled"}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card>
          <CardContent>
            <CardTitle>Recent audit logs</CardTitle>
            {logs.length === 0 ? (
              <EmptyState title="No logs yet" />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--pp-border)" }}>
                    <th style={{ padding: 8 }}>Action</th>
                    <th style={{ padding: 8 }}>User</th>
                    <th style={{ padding: 8 }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--pp-border)" }}>
                      <td style={{ padding: 8 }}>{log.action}</td>
                      <td style={{ padding: 8 }}>{log.user?.email ?? "—"}</td>
                      <td style={{ padding: 8 }}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
