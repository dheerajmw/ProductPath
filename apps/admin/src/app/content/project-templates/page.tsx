"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout, Card, CardContent, CardTitle, Alert, Spinner } from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AdminProjectTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<
    {
      id: string;
      slug: string;
      title: string;
      published: boolean;
      sortOrder: number;
      role: { name: string; slug: string };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((me) => {
        if (me.user.platformRole !== "ADMIN") throw new ApiError("Forbidden", 403);
        return fetch(`${API_URL}/admin/content/project-templates`, { credentials: "include" }).then(
          async (res) => {
            const data = await res.json();
            if (!res.ok) throw new ApiError(data.error ?? "Failed", res.status);
            return data as { templates: typeof templates };
          },
        );
      })
      .then((res) => setTemplates(res.templates))
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
        <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}>
          ← Admin
        </Link>
      }
    >
      <Card>
        <CardContent>
          <CardTitle>Project templates</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8, fontSize: "0.875rem" }}>
            Seeded for PM in Phase 4. Create additional templates via API POST{" "}
            <code>/admin/content/project-templates</code>.
          </p>
        </CardContent>
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--pp-border)", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Title</th>
            <th style={{ padding: 8 }}>Slug</th>
            <th style={{ padding: 8 }}>Role</th>
            <th style={{ padding: 8 }}>Published</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id} style={{ borderBottom: "1px solid var(--pp-border)" }}>
              <td style={{ padding: 8 }}>{t.title}</td>
              <td style={{ padding: 8 }}>{t.slug}</td>
              <td style={{ padding: 8 }}>{t.role.name}</td>
              <td style={{ padding: 8 }}>{t.published ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PageLayout>
  );
}
