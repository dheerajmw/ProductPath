"use client";

import Link from "next/link";
import { Card, CardContent, CardTitle, Button, Alert } from "@productpath/ui";
import { CandidateAppShell } from "@/components/app-shell";

export default function PrepareToLearnPage() {
  return (
    <CandidateAppShell title="Prepare to learn">
      <section className="pp-prepare-hub">
        <header className="pp-prepare-hub-hero">
          <span className="pp-pill pp-pill--primary">Optional</span>
          <h2 className="pp-headline-lg" style={{ margin: "16px 0 12px", fontSize: "1.75rem" }}>
            Learn before your <span className="pp-gradient-text">skill assessment</span>
          </h2>
          <p className="pp-body-muted" style={{ maxWidth: 560, margin: 0, lineHeight: 1.55 }}>
            Roadmaps are not required to submit projects or build your proof-of-work profile. Use
            them only if you want structured prep before taking the timed assessment.
          </p>
        </header>

        <div style={{ marginTop: 24 }}>
          <Alert variant="info">
            Your main path is <strong>project submissions</strong> — start there anytime from the
            sidebar. Learning progress can unlock the assessment sooner and improve your score, but it
            is entirely your choice.
          </Alert>
        </div>

        <div className="pp-prepare-hub-grid">
          <Card>
            <CardContent>
              <span className="material-symbols-outlined" style={{ color: "var(--pp-primary)", fontSize: 32 }}>
                map
              </span>
              <CardTitle style={{ marginTop: 16 }}>Role roadmaps</CardTitle>
              <p className="pp-body-muted" style={{ margin: "8px 0 20px" }}>
                Module-based learning for your active product role. Complete resources at your own
                pace before the assessment.
              </p>
              <Link href="/learn/roadmaps">
                <Button>Browse roadmaps</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <span className="material-symbols-outlined" style={{ color: "var(--pp-secondary)", fontSize: 32 }}>
                quiz
              </span>
              <CardTitle style={{ marginTop: 16 }}>Skip to assessment</CardTitle>
              <p className="pp-body-muted" style={{ margin: "8px 0 20px" }}>
                Ready to test now? You can start the skill assessment without finishing roadmaps
                (minimum progress may still apply).
              </p>
              <Link href="/assessments">
                <Button variant="secondary">Go to skill assessment</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <span className="material-symbols-outlined" style={{ color: "var(--pp-primary-fixed-dim)", fontSize: 32 }}>
                folder_special
              </span>
              <CardTitle style={{ marginTop: 16 }}>Project submissions</CardTitle>
              <p className="pp-body-muted" style={{ margin: "8px 0 20px" }}>
                The core of ProductPath — submit proof-of-work projects that count toward verification.
              </p>
              <Link href="/projects">
                <Button variant="secondary">Open project submissions</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </CandidateAppShell>
  );
}
