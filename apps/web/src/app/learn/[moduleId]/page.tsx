"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  Alert,
  Spinner,
  Button,
} from "@productpath/ui";
import { api, ApiError, type ModuleDetailResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";
import { ResourceViewer } from "@/components/resource-viewer";

export default function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ModuleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    return api.getModule(moduleId).then(setData);
  }

  useEffect(() => {
    load()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load module");
      })
      .finally(() => setLoading(false));
  }, [moduleId, router]);

  async function toggleResource(resourceId: string, completed: boolean) {
    setBusy(resourceId);
    try {
      const updated = await api.toggleResource(moduleId, resourceId, completed);
      setData(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function markComplete() {
    setBusy("complete");
    try {
      const updated = await api.completeModule(moduleId);
      setData(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not complete module");
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Module">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (error && !data) {
    return (
      <CandidateAppShell title="Module">
        <Alert variant="error">{error}</Alert>
        <Link href="/learn">← Back to roadmap</Link>
      </CandidateAppShell>
    );
  }

  if (!data) return null;

  return (
    <CandidateAppShell title="Module">
      <p style={{ marginBottom: 16 }}>
        <Link href="/learn">← Back to roadmap</Link>
      </p>

      {error ? (
        <div style={{ marginBottom: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <Card>
        <CardContent>
          <CardTitle>{data.module.title}</CardTitle>
          <CardDescription>{data.module.description}</CardDescription>
          {data.module.locked ? (
            <div style={{ marginTop: 12 }}>
              <Alert variant="info">
                Complete prerequisite modules first:{" "}
                {data.prerequisites.map((p) => p.title).join(", ")}
              </Alert>
            </div>
          ) : null}
          {data.module.status === "COMPLETED" ? (
            <div style={{ marginTop: 12 }}>
              <Alert variant="success">Module completed</Alert>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {data.resources.map((resource) => (
          <Card key={resource.id}>
            <CardContent>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <strong>{resource.title}</strong>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: "0.75rem",
                      color: "var(--pp-muted)",
                    }}
                  >
                    {resource.type}
                    {resource.required ? " · Required" : " · Optional"}
                  </span>
                </div>
                {!data.module.locked ? (
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                    <input
                      type="checkbox"
                      checked={resource.completed}
                      disabled={busy === resource.id}
                      onChange={(e) => toggleResource(resource.id, e.target.checked)}
                    />
                    Done
                  </label>
                ) : null}
              </div>
              <div style={{ marginTop: 12 }}>
                <ResourceViewer resource={resource} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!data.module.locked && data.module.status !== "COMPLETED" ? (
        <div style={{ marginTop: 24 }}>
          <Button
            loading={busy === "complete"}
            disabled={!data.canComplete}
            onClick={markComplete}
          >
            Mark module complete
          </Button>
          {!data.canComplete ? (
            <p style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--pp-muted)" }}>
              Check off all required resources to finish this module.
            </p>
          ) : null}
        </div>
      ) : null}
    </CandidateAppShell>
  );
}
