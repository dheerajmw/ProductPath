import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { SignupClient } from "./signup-client";

export default function SignupPage() {
  return (
    <MarketingShell
      headerExtra={
        <Link href="/login" className="pp-label-caps" style={{ color: "var(--pp-muted)" }}>
          Log in
        </Link>
      }
    >
      <div className="pp-auth-brand">
        <h1 className="pp-headline-md" style={{ margin: 0, color: "var(--pp-primary)" }}>
          ProductPath
        </h1>
        <p className="pp-auth-brand-tagline">Start your skill-first path</p>
      </div>
      <div className="pp-glass-card" style={{ padding: 32, width: "100%", maxWidth: 420 }}>
        <h2 className="pp-headline-md" style={{ margin: "0 0 8px" }}>
          Create your account
        </h2>
        <p className="pp-body-muted" style={{ margin: "0 0 24px" }}>
          Join candidates building verified product careers.
        </p>
        <SignupClient />
        <p className="pp-body-muted" style={{ marginTop: 20, fontSize: "0.875rem" }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
        <p className="pp-body-muted" style={{ marginTop: 12, fontSize: "0.875rem" }}>
          Hiring?{" "}
          <Link href="/recruiter/onboarding">Create a recruiter account</Link>
        </p>
      </div>
    </MarketingShell>
  );
}
