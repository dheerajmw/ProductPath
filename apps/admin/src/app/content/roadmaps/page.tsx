"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Card,
  CardContent,
  CardTitle,
  Button,
  Alert,
  Spinner,
  EmptyState,
} from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

export default function AdminRoadmapsPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<
    {
      id: string;
      title: string;
      version: number;
      published: boolean;
      role: { slug: string; name: string };
      _count: { modules: number };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((me) => {
        if (me.user.platformRole !== "ADMIN") throw new ApiError("Forbidden", 403);
        return adminApi.listRoadmaps();
      })
      .then((res) => setRoadmaps(res.roadmaps))
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
          <strong>Content — Roadmaps</strong>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/dashboard">Dashboard</Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          <CardTitle>Learning roadmaps</CardTitle>
          {roadmaps.length === 0 ? (
            <EmptyState title="No roadmaps" description="Run db:seed to create the PM roadmap." />
          ) : (
            <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--pp-border)" }}>
                  <th style={{ padding: 8 }}>Title</th>
                  <th style={{ padding: 8 }}>Role</th>
                  <th style={{ padding: 8 }}>Version</th>
                  <th style={{ padding: 8 }}>Modules</th>
                  <th style={{ padding: 8 }}>Published</th>
                </tr>
              </thead>
              <tbody>
                {roadmaps.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--pp-border)" }}>
                    <td style={{ padding: 8 }}>
                      <Link href={`/content/roadmaps/${r.id}`}>{r.title}</Link>
                    </td>
                    <td style={{ padding: 8 }}>{r.role.name}</td>
                    <td style={{ padding: 8 }}>v{r.version}</td>
                    <td style={{ padding: 8 }}>{r._count.modules}</td>
                    <td style={{ padding: 8 }}>{r.published ? "Yes" : "No"}</td>
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
