import Link from "next/link";
import { Button } from "@productpath/ui";
import { MarketingShell } from "@/components/marketing-shell";

const CANDIDATE_JOURNEY = [
  {
    icon: "assignment_turned_in",
    title: "Skill assessment",
    desc: "Validate product intuition through industry-standard tests.",
  },
  {
    icon: "folder_special",
    title: "Live projects",
    desc: "Build real features and solve product problems in a sandbox.",
  },
  {
    icon: "verified",
    title: "Verification",
    desc: "Earn verification recruiters trust—not pedigree alone.",
  },
] as const;

const PARTNER_JOURNEY = [
  {
    icon: "search",
    title: "Targeted sourcing",
    desc: "Filter by verified skills, not just company logos.",
  },
  {
    icon: "monitoring",
    title: "Data-driven insights",
    desc: "See assessment data and project performance for every lead.",
  },
  {
    icon: "handshake",
    title: "Seamless connection",
    desc: "Send interest requests when candidates opt in to discovery.",
  },
] as const;

const TRADITIONAL = [
  "Resume keyword scanning",
  "Prestige bias (pedigree alone)",
  "Months-long vetting process",
  "Static PDF portfolios",
] as const;

const SKILL_FIRST = [
  "Verified competency data",
  "Performance-based signals",
  "Opt-in talent discovery",
  "Live proof-of-work profiles",
] as const;

export default function HomePage() {
  return (
    <MarketingShell
      centered={false}
      headerExtra={
        <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href="/login" className="pp-label-caps" style={{ color: "var(--pp-muted)" }}>
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      }
    >
      <section className="pp-marketing-hero">
        <span className="pp-pill pp-pill--success" style={{ marginBottom: 32 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            verified
          </span>
          Verified talent network
        </span>
        <h1 className="pp-display-hero">
          The trusted network for <br />
          <span className="pp-gradient-text">product talent.</span>
        </h1>
        <p className="pp-body-muted pp-hero-lead">
          Assess skills, build proof through projects, earn verification, and connect with
          opportunities—the mission control for your professional life.
        </p>
        <div className="pp-hero-cta-row">
          <Link href="/signup">
            <Button size="lg">Launch your roadmap</Button>
          </Link>
          <Link href="/recruiter/onboarding">
            <Button size="lg" variant="secondary">
              Hire verified talent
            </Button>
          </Link>
        </div>
      </section>

      <section className="pp-journey-section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="pp-headline-lg" style={{ margin: "0 0 12px" }}>
            Parallel journeys
          </h2>
          <p className="pp-body-muted" style={{ margin: 0, fontSize: "1.125rem" }}>
            Designed for high-performance candidates and hiring partners.
          </p>
        </div>
        <div className="pp-journey-grid">
          <article className="pp-glass-card pp-journey-card">
            <div className="pp-journey-card-deco" aria-hidden>
              <span className="material-symbols-outlined" style={{ fontSize: 80 }}>
                rocket_launch
              </span>
            </div>
            <h3 className="pp-headline-md" style={{ color: "var(--pp-secondary)", margin: "0 0 24px" }}>
              For candidates
            </h3>
            <ul className="pp-journey-list">
              {CANDIDATE_JOURNEY.map((item) => (
                <li key={item.title} className="pp-journey-item">
                  <div className="pp-journey-item-icon pp-journey-item-icon--secondary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{item.title}</p>
                    <p className="pp-body-muted" style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/signup">
                <Button>Join the path</Button>
              </Link>
              <Link href="/login?role=candidate">
                <Button variant="secondary">Candidate log in</Button>
              </Link>
            </div>
          </article>

          <article className="pp-glass-card pp-journey-card">
            <div className="pp-journey-card-deco" aria-hidden>
              <span className="material-symbols-outlined" style={{ fontSize: 80 }}>
                corporate_fare
              </span>
            </div>
            <h3
              className="pp-headline-md"
              style={{ color: "var(--pp-primary-fixed-dim)", margin: "0 0 24px" }}
            >
              For partners
            </h3>
            <ul className="pp-journey-list">
              {PARTNER_JOURNEY.map((item) => (
                <li key={item.title} className="pp-journey-item">
                  <div className="pp-journey-item-icon pp-journey-item-icon--primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{item.title}</p>
                    <p className="pp-body-muted" style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/recruiter/onboarding">
                <Button>Create recruiter account</Button>
              </Link>
              <Link href="/login?role=recruiter">
                <Button variant="secondary">Partner log in</Button>
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section style={{ padding: "80px var(--pp-gutter)" }}>
        <h2 className="pp-headline-lg" style={{ textAlign: "center", margin: "0 0 48px" }}>
          The skill-first advantage
        </h2>
        <div className="pp-comparison-grid">
          <div className="pp-comparison-col">
            <p className="pp-label-caps" style={{ marginBottom: 24 }}>
              Traditional hiring
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20, opacity: 0.65 }}>
              {TRADITIONAL.map((line) => (
                <li key={line} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--pp-danger)" }}>
                    close
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pp-comparison-col pp-comparison-col--highlight">
            <p className="pp-label-caps" style={{ marginBottom: 24, color: "var(--pp-primary)", position: "relative" }}>
              Skill-first (ProductPath)
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
              {SKILL_FIRST.map((line) => (
                <li key={line} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--pp-secondary)" }}>
                    check_circle
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pp-journey-section">
        <div className="pp-glass-card" style={{ padding: 48, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(216, 226, 255, 0.05)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 className="pp-headline-lg" style={{ margin: "0 0 16px" }}>
              Ready to define your path?
            </h2>
            <p className="pp-body-muted" style={{ maxWidth: 520, margin: "0 auto 32px", fontSize: "1.125rem" }}>
              Build, verify, and connect on the platform built for modern product hiring.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="pp-marketing-footer">
        <span className="pp-label-caps" style={{ color: "var(--pp-primary)" }}>
          ProductPath OS
        </span>
        <span className="pp-body-muted" style={{ fontSize: "0.625rem" }}>
          © {new Date().getFullYear()} ProductPath. All rights reserved.
        </span>
      </footer>
    </MarketingShell>
  );
}
