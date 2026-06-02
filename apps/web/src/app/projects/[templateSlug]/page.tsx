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
import { api, ApiError } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

export default function ProjectTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const slug = String(params.templateSlug);
  const [instructions, setInstructions] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProjectTemplate(slug)
      .then((res) => {
        setInstructions(res.template.instructions);
        setTitle(res.template.title);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function startDraft() {
    setStarting(true);
    setError(null);
    try {
      const tmpl = await api.getProjectTemplate(slug);
      if (!tmpl.template.id) throw new Error("Template missing id");
      const { submission } = await api.createProjectSubmission({
        templateId: tmpl.template.id,
        title,
      });
      router.push(`/projects/submissions/${submission.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start project");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Projects">
        <Spinner size={32} />
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Projects">
      <Card>
        <CardContent>
          <CardTitle>{title}</CardTitle>
          <pre
            style={{
              marginTop: 16,
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              fontSize: "0.875rem",
              color: "var(--pp-muted)",
            }}
          >
            {instructions}
          </pre>
        </CardContent>
      </Card>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <Card style={{ marginTop: 24 }}>
        <CardContent>
          <CardTitle>Start submission</CardTitle>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: "0.875rem" }}>Project title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginTop: 6 }} />
          </div>
          <Button style={{ marginTop: 16 }} onClick={startDraft} disabled={starting}>
            {starting ? "Creating…" : "Create draft"}
          </Button>
        </CardContent>
      </Card>

      <Link href="/projects" style={{ display: "inline-block", marginTop: 24 }}>
        <Button variant="secondary">Back to hub</Button>
      </Link>
    </CandidateAppShell>
  );
}
