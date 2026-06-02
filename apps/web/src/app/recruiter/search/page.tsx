"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Card,
  CardContent,
  CardTitle,
  Input,
  Label,
  Button,
  Alert,
  Spinner,
  EmptyState,
  VerificationBadge,
} from "@productpath/ui";
import { api, ApiError, type RecruiterMeResponse, type TalentSearchResponse } from "@/lib/api";
import { RecruiterShell } from "@/components/recruiter-shell";

export default function RecruiterSearchPage() {
  const router = useRouter();
  const [me, setMe] = useState<RecruiterMeResponse | null>(null);
  const [q, setQ] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [results, setResults] = useState<TalentSearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .me()
      .then((auth) => {
        if (auth.user.platformRole !== "RECRUITER") {
          router.replace("/dashboard");
          return;
        }
        return api.getRecruiterMe();
      })
      .then((profile) => {
        setMe(profile ?? null);
        if (profile && !profile.verified) return;
        return api.searchTalent().then(setResults);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearching(true);
    setError(null);
    try {
      const data = await api.searchTalent({
        q: q || undefined,
        roleSlug: roleSlug || undefined,
      });
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <RecruiterShell title="Talent search">
        <Spinner size={32} />
      </RecruiterShell>
    );
  }

  if (me && !me.verified) {
    return (
      <RecruiterShell title="Talent search">
        <Alert variant="info">
          Your recruiter account is pending verification. You will be able to search talent once an
          admin approves your company{me.companyDomain ? ` or your email matches @${me.companyDomain}` : ""}.
        </Alert>
      </RecruiterShell>
    );
  }

  return (
    <RecruiterShell title="Talent search">
      <Card>
        <CardContent>
          <CardTitle>Talent search</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>
            Only interview-ready candidates who opted into discovery appear here.
          </p>
          <form
            onSubmit={runSearch}
            style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}
          >
            <div style={{ minWidth: 240 }}>
              <Label htmlFor="q">Name contains</Label>
              <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div style={{ minWidth: 240 }}>
              <Label htmlFor="roleSlug">Role slug</Label>
              <Input
                id="roleSlug"
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value)}
                placeholder="e.g. product-manager"
              />
            </div>
            <Button type="submit" disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {results && results.candidates.length === 0 ? (
          <EmptyState title="No candidates match" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results?.candidates.map((c) => (
              <Card key={c.id}>
                <CardContent>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{c.displayName ?? "Candidate"}</p>
                      <p style={{ margin: "4px 0", fontSize: "0.875rem", color: "var(--pp-muted)" }}>
                        {c.role.name}
                        {c.overallScore != null ? ` · ${Math.round(c.overallScore)}% assessment` : ""}
                        {c.approvedProjects > 0 ? ` · ${c.approvedProjects} approved project(s)` : ""}
                      </p>
                      <VerificationBadge
                        state={c.verificationState as "INTERVIEW_READY" | "VERIFIED_PROFESSIONAL"}
                        validUntil={c.validUntil}
                      />
                    </div>
                    <Link href={`/recruiter/candidates/${c.id}`}>
                      <Button size="sm">View profile</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
