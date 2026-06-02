"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  Alert,
  Spinner,
} from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

export default function AdminRoadmapDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<{
    id: string;
    title: string;
    description: string | null;
    modules: {
      id: string;
      title: string;
      slug: string;
      sortOrder: number;
      resources: { id: string; title: string; type: string }[];
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getRoadmap(id)
      .then((res) => setRoadmap(res.roadmap))
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.push("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <PageLayout>
        <Spinner size={32} />
      </PageLayout>
    );
  }

  if (error || !roadmap) {
    return (
      <PageLayout>
        <Alert variant="error">{error ?? "Not found"}</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      header={
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/content/roadmaps">← Roadmaps</Link>
          <strong>{roadmap.title}</strong>
        </div>
      }
    >
      <Card>
        <CardContent>
          <CardTitle>{roadmap.title}</CardTitle>
          <CardDescription>{roadmap.description}</CardDescription>
        </CardContent>
      </Card>

      <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {roadmap.modules.map((mod) => (
          <Card key={mod.id}>
            <CardContent>
              <strong>
                {mod.sortOrder}. {mod.title}
              </strong>
              <p style={{ margin: "4px 0 8px", fontSize: "0.8125rem", color: "var(--pp-muted)" }}>
                {mod.slug}
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.875rem" }}>
                {mod.resources.map((res) => (
                  <li key={res.id}>
                    {res.title} <span style={{ color: "var(--pp-muted)" }}>({res.type})</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
