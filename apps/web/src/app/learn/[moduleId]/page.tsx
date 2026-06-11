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
import {
  findCurriculumForModuleSlug,
} from "@/data/learning/curriculum";
import {
  RoleCurriculumModuleView,
} from "@/components/learning/role-curriculum-module-view";

const RESERVED_MODULE_IDS = new Set(["roadmaps"]);

export default function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ModuleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const isReserved = RESERVED_MODULE_IDS.has(moduleId);

  useEffect(() => {
    if (isReserved) {
      router.replace("/learn/roadmaps");
    }
  }, [isReserved, router]);

  function load() {
    return api.getModule(moduleId).then(setData);
  }

  useEffect(() => {
    if (isReserved) return;
    load()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load module");
      })
      .finally(() => setLoading(false));
  }, [moduleId, router, isReserved]);

  if (isReserved) {
    return (
      <CandidateAppShell title="Module">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

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
        <Link href="/learn/roadmaps">← Back to roadmaps</Link>
      </CandidateAppShell>
    );
  }

  if (!data) return null;

  const curriculum = findCurriculumForModuleSlug(data.module.slug);

  return (
    <CandidateAppShell title="Module">
      <p style={{ marginBottom: 16 }}>
        <Link href="/learn/roadmaps">← Back to roadmaps</Link>
      </p>

      {error ? (
        <div style={{ marginBottom: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      {curriculum ? (
        <RoleCurriculumModuleView
          curriculum={curriculum}
          data={data}
          busy={busy}
          onToggleResource={toggleResource}
          onMarkComplete={markComplete}
        />
      ) : (
        <>
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
        </>
      )}
    </CandidateAppShell>
  );
}
