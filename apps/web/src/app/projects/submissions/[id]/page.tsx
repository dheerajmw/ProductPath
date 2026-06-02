"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  Alert,
  Button,
  Spinner,
  Input,
} from "@productpath/ui";
import { api, ApiError, type ProjectSubmissionDetailResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function ProjectSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [data, setData] = useState<ProjectSubmissionDetailResponse | null>(null);
  const [title, setTitle] = useState("");
  const [narrative, setNarrative] = useState("");
  const [urlName, setUrlName] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    return api.getProjectSubmission(id).then((res) => {
      setData(res);
      setTitle(res.submission.title ?? "");
      setNarrative(res.submission.narrative ?? "");
    });
  }

  useEffect(() => {
    load()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function save() {
    if (!data?.submission.editable) return;
    setSaving(true);
    setError(null);
    try {
      const urlArtifacts = data.submission.artifacts
        .filter((a) => a.type === "URL")
        .map((a) => ({ type: "URL" as const, name: a.name, url: a.url }));
      if (urlName && urlValue) {
        urlArtifacts.push({ type: "URL", name: urlName, url: urlValue });
      }
      await api.updateProjectSubmission(id, { title, narrative, artifactUrls: urlArtifacts });
      setUrlName("");
      setUrlValue("");
      setMessage("Saved");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(file: File | null) {
    if (!file || !data?.submission.editable) return;
    setSaving(true);
    setError(null);
    try {
      await api.uploadProjectFile(id, file);
      await load();
      setMessage("File uploaded");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit() {
    setSaving(true);
    setError(null);
    try {
      await save();
      await api.submitProject(id);
      await load();
      setMessage("Submitted for review");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  async function onResubmit() {
    setSaving(true);
    setError(null);
    try {
      const { submission } = await api.resubmitProject(id);
      router.push(`/projects/submissions/${submission.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Resubmit failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Submission">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  if (!data) {
    return (
      <CandidateAppShell title="Submission">
        <Alert variant="error">{error ?? "Not found"}</Alert>
      </CandidateAppShell>
    );
  }

  const sub = data.submission;
  const approved = sub.status === "APPROVED";
  const rejected = sub.status === "REJECTED";
  const inReview = sub.status === "UNDER_REVIEW";

  return (
    <CandidateAppShell title="Submission">
      <Card>
        <CardContent>
          <CardTitle>
            {sub.title ?? data.template.title} · v{sub.version}
          </CardTitle>
          <p style={{ marginTop: 8, color: "var(--pp-muted)" }}>
            Status: <strong>{sub.status.replace(/_/g, " ")}</strong>
            {approved ? (
              <span style={{ marginLeft: 8, color: "green" }}>✓ Approved</span>
            ) : null}
          </p>
        </CardContent>
      </Card>

      {sub.latestReview ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant={rejected ? "error" : approved ? "success" : "info"}>
            <strong>Reviewer feedback</strong>
            <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{sub.latestReview.feedback}</p>
          </Alert>
        </div>
      ) : null}

      {inReview ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="info">Your submission is locked while under review.</Alert>
        </div>
      ) : null}

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="success">{message}</Alert>
        </div>
      ) : null}

      {sub.editable ? (
        <Card style={{ marginTop: 24 }}>
          <CardContent>
            <CardTitle>Edit draft</CardTitle>
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.875rem" }}>Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginTop: 6 }} />
              </div>
              <div>
                <label style={{ fontSize: "0.875rem" }}>Narrative</label>
                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  rows={8}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: "var(--pp-radius)",
                    border: "1px solid var(--pp-border)",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.875rem" }}>Add link (Figma, Doc, etc.)</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                  <Input placeholder="Label" value={urlName} onChange={(e) => setUrlName(e.target.value)} />
                  <Input placeholder="https://..." value={urlValue} onChange={(e) => setUrlValue(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.875rem" }}>Upload file (PDF, images, zip — max 10MB)</label>
                <input
                  type="file"
                  style={{ marginTop: 6 }}
                  onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button onClick={save} disabled={saving}>
                Save
              </Button>
              <Button variant="secondary" onClick={onSubmit} disabled={saving}>
                Submit for review
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {sub.artifacts.length > 0 ? (
        <Card style={{ marginTop: 24 }}>
          <CardContent>
            <CardTitle>Artifacts</CardTitle>
            <ul style={{ marginTop: 12, paddingLeft: 20 }}>
              {sub.artifacts.map((a, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.name}
                  </a>{" "}
                  <span style={{ color: "var(--pp-muted)", fontSize: "0.75rem" }}>({a.type})</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {rejected ? (
        <div style={{ marginTop: 24 }}>
          <Button onClick={onResubmit} disabled={saving}>
            Create resubmission (v{sub.version + 1})
          </Button>
        </div>
      ) : null}

      <Link href="/projects" style={{ display: "inline-block", marginTop: 24 }}>
        <Button variant="secondary">Back to hub</Button>
      </Link>
    </CandidateAppShell>
  );
}
