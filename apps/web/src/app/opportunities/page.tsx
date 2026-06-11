"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, Button, Spinner, EmptyState } from "@productpath/ui";
import { api, ApiError, type InterestSummary, type VerificationResponse } from "@/lib/api";
import { CandidateAppShell } from "@/components/app-shell";

function statusPill(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "PENDING") return "pp-pill pp-pill--primary";
  if (normalized === "ACCEPTED") return "pp-pill pp-pill--success";
  return "pp-pill";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase();
}

function PlaceholderCards() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="pp-opportunity-placeholder" aria-hidden>
          <div className="pp-opportunity-placeholder-logo" />
          <div className="pp-opportunity-placeholder-line" style={{ width: "75%" }} />
          <div className="pp-opportunity-placeholder-line pp-opportunity-placeholder-line--short" />
          <div className="pp-opportunity-placeholder-line pp-opportunity-placeholder-line--full" />
          <div className="pp-opportunity-placeholder-line pp-opportunity-placeholder-line--full" />
        </div>
      ))}
    </>
  );
}

function OpportunityCard({
  item,
  actingId,
  revealedEmail,
  onRespond,
}: {
  item: InterestSummary;
  actingId: string | null;
  revealedEmail?: string;
  onRespond: (id: string, action: "accept" | "decline") => void;
}) {
  const company = item.recruiter?.company ?? "Recruiter";
  const contact = revealedEmail ?? item.connection?.recruiterEmail;

  return (
    <article className="pp-opportunity-card">
      <div className="pp-opportunity-card-logo" aria-hidden>
        <span className="material-symbols-outlined">business</span>
      </div>
      <div>
        <h3 className="pp-opportunity-card-company">{company}</h3>
        <p className="pp-opportunity-card-meta">
          {item.recruiter?.verified ? (
            <span className="pp-pill pp-pill--success" style={{ fontSize: "0.625rem", marginRight: 8 }}>
              Verified recruiter
            </span>
          ) : null}
          {item.expiresAt
            ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}`
            : "No expiry"}
        </p>
      </div>
      <span className={statusPill(item.status)} style={{ alignSelf: "flex-start", textTransform: "capitalize" }}>
        {statusLabel(item.status)}
      </span>
      <p className="pp-opportunity-card-message">{item.message}</p>
      {item.status === "PENDING" ? (
        <div className="pp-opportunity-card-actions">
          <Button size="sm" disabled={actingId === item.id} onClick={() => onRespond(item.id, "accept")}>
            Accept
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={actingId === item.id}
            onClick={() => onRespond(item.id, "decline")}
          >
            Decline
          </Button>
        </div>
      ) : null}
      {item.status === "ACCEPTED" && contact ? (
        <Alert variant="info">
          <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: "middle", marginRight: 6 }}>
            mail
          </span>
          Contact: {contact}
        </Alert>
      ) : null}
    </article>
  );
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<InterestSummary[]>([]);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  function loadInterests() {
    return api.getMyInterests().then((res) => setInterests(res.interests));
  }

  useEffect(() => {
    api
      .me()
      .then((me) => {
        if (me.user.platformRole !== "CANDIDATE") {
          router.replace("/dashboard");
          return;
        }
        return Promise.all([
          loadInterests(),
          api.getVerification().then(setVerification).catch(() => setVerification(null)),
        ]);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
        else setError(err instanceof ApiError ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const isTalentUnlocked = useMemo(() => {
    if (interests.length > 0) return true;
    if (!verification) return false;
    return (
      verification.badges.interviewReady ||
      verification.badges.verifiedProfessional ||
      verification.discoveryEligible === true
    );
  }, [interests.length, verification]);

  const pendingCount = interests.filter((i) => i.status === "PENDING").length;
  const acceptedCount = interests.filter((i) => i.status === "ACCEPTED").length;

  async function respond(id: string, action: "accept" | "decline") {
    setActingId(id);
    setError(null);
    try {
      const res = await api.respondToInterest(id, action);
      if (res.connection?.recruiter.email) {
        setRevealed((prev) => ({ ...prev, [id]: res.connection!.recruiter.email }));
      }
      await loadInterests();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <CandidateAppShell title="Opportunities">
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner size={32} />
        </div>
      </CandidateAppShell>
    );
  }

  return (
    <CandidateAppShell title="Opportunities">
      <header className="pp-opportunities-hero">
        <div>
          <p className="pp-opportunities-eyebrow">Talent marketplace</p>
          <h2 className="pp-headline-lg" style={{ fontSize: "1.75rem", margin: "0 0 8px" }}>
            Career <span className="pp-gradient-text">Opportunities</span>
          </h2>
          <p className="pp-body-muted" style={{ maxWidth: 560, margin: 0 }}>
            Top companies and verified recruiters reach out when you are interview-ready. Review interest
            requests and accept to reveal contact details.
          </p>
          {isTalentUnlocked ? (
            <div className="pp-opportunities-stats">
              <span className="pp-pill pp-pill--primary">{pendingCount} pending</span>
              <span className="pp-pill pp-pill--success">{acceptedCount} accepted</span>
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/settings/discovery">
            <Button variant="secondary">Discovery settings</Button>
          </Link>
          <Link href="/community">
            <Button variant="ghost">Talent network</Button>
          </Link>
        </div>
      </header>

      {error ? (
        <div style={{ marginBottom: 20 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <section className="pp-glass-card pp-opportunities-panel">
        <div className="pp-opportunities-panel-header">
          <div>
            <h3 className="pp-headline-md" style={{ margin: 0, fontSize: "1.25rem" }}>
              Interest inbox
            </h3>
            <p className="pp-body-muted" style={{ margin: "6px 0 0", fontSize: "0.875rem" }}>
              Recruiter messages from ProductPath talent search
            </p>
          </div>
          {isTalentUnlocked ? (
            <Link href="/profile">
              <Button size="sm" variant="secondary">
                Verification status
              </Button>
            </Link>
          ) : null}
        </div>

        <div
          className={`pp-opportunities-grid${!isTalentUnlocked ? " pp-opportunities-grid--blurred" : ""}`}
        >
          {!isTalentUnlocked ? (
            <PlaceholderCards />
          ) : interests.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "8px 0 24px" }}>
              <EmptyState
                title="No interest requests yet"
                description="Enable discovery in settings when you are interview-ready. Recruiters can then send you opportunities."
              />
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Link href="/settings/discovery">
                  <Button>Open discovery settings</Button>
                </Link>
              </div>
            </div>
          ) : (
            interests.map((item) => (
              <OpportunityCard
                key={item.id}
                item={item}
                actingId={actingId}
                revealedEmail={revealed[item.id]}
                onRespond={respond}
              />
            ))
          )}
        </div>

        {!isTalentUnlocked ? (
          <div className="pp-opportunities-lock">
            <div className="pp-opportunities-lock-icon" aria-hidden>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock_person
              </span>
            </div>
            <h4 className="pp-headline-md" style={{ margin: "0 0 12px", fontSize: "1.375rem" }}>
              Verification required
            </h4>
            <p className="pp-body-muted" style={{ maxWidth: 420, margin: "0 0 24px" }}>
              This section is for candidates who have reached interview-ready status. Complete your
              assessment, projects, and verification checklist to unlock recruiter opportunities.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <Link href="/profile">
                <Button size="lg">Get verified to unlock</Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="secondary">
                  Submit a project
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </CandidateAppShell>
  );
}
