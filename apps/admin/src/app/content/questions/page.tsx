"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Card,
  CardContent,
  CardTitle,
  Alert,
  Spinner,
} from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function adminFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Failed", res.status);
  return data as T;
}

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<
    {
      id: string;
      prompt: string;
      sortOrder: number;
      correctIndex: number;
      options: string[];
      skill: { name: string; slug: string };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then((me) => {
        if (me.user.platformRole !== "ADMIN") throw new ApiError("Forbidden", 403);
        return adminFetch<{ questions: typeof questions }>("/admin/content/questions");
      })
      .then((res) => setQuestions(res.questions))
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
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/dashboard">Dashboard</Link>
          <strong>Question bank</strong>
        </div>
      }
    >
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <CardTitle>Questions ({questions.length})</CardTitle>
          <div style={{ marginTop: 16, maxHeight: 480, overflow: "auto" }}>
            {questions.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: 12,
                  borderBottom: "1px solid var(--pp-border)",
                  fontSize: "0.875rem",
                }}
              >
                <div style={{ color: "var(--pp-muted)", marginBottom: 4 }}>
                  {q.skill.name} · order {q.sortOrder}
                </div>
                <strong>{q.prompt}</strong>
                <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                  {(q.options as string[]).map((o, i) => (
                    <li key={i} style={{ fontWeight: i === q.correctIndex ? 700 : 400 }}>
                      {o}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
