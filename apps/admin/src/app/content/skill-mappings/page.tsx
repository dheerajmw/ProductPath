"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout, Card, CardContent, CardTitle, Alert, Spinner } from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

export default function AdminSkillMappingsPage() {
  const router = useRouter();
  const [mappings, setMappings] = useState<
    {
      id: string;
      priority: number;
      skill: { name: string; slug: string };
      module: {
        slug: string;
        title: string;
        roadmap: { role: { name: string; slug: string } };
      };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((me) => {
        if (me.user.platformRole !== "ADMIN") throw new ApiError("Forbidden", 403);
        return adminApi.listSkillMappings();
      })
      .then((res) => setMappings(res.mappings))
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed");
      })
      .finally(() => setLoading(false));
  }, [router]);

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}>
            ← Admin
          </Link>
        </div>
      }
    >
      <Card>
        <CardContent>
          <CardTitle>Skill → module mappings</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8, fontSize: "0.875rem" }}>
            Maps assessment skills to learning modules for gap recommendations (Phase 3). Seeded for
            PM; extend via API <code>PUT /admin/content/skill-mappings</code>.
          </p>
        </CardContent>
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div style={{ marginTop: 24 }}>
        {mappings.length === 0 ? (
          <Alert variant="info">No mappings yet. Run db:seed after migrations.</Alert>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--pp-border)" }}>
                <th style={{ padding: 8 }}>Skill</th>
                <th style={{ padding: 8 }}>Module</th>
                <th style={{ padding: 8 }}>Role</th>
                <th style={{ padding: 8 }}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--pp-border)" }}>
                  <td style={{ padding: 8 }}>{m.skill.name}</td>
                  <td style={{ padding: 8 }}>{m.module.title}</td>
                  <td style={{ padding: 8 }}>{m.module.roadmap.role.name}</td>
                  <td style={{ padding: 8 }}>{m.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageLayout>
  );
}
