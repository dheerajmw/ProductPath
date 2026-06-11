"use client";

import Link from "next/link";
import { Button } from "@productpath/ui";
import type { RecruiterMeResponse } from "@/lib/api";

type Props = {
  profile: RecruiterMeResponse;
};

export function RecruiterPendingVerification({ profile }: Props) {
  return (
    <div className="pp-recruiter-pending">
      <div className="pp-recruiter-pending-bg pp-recruiter-pending-bg--tl" aria-hidden />
      <div className="pp-recruiter-pending-bg pp-recruiter-pending-bg--br" aria-hidden />

      <div className="pp-recruiter-pending-inner">
        <div className="pp-recruiter-pending-hero">
          <div className="pp-recruiter-pending-badge">
            <span className="material-symbols-outlined">hourglass_top</span>
          </div>

          <span className="pp-recruiter-pending-pill">Pending verification</span>

          <h2 className="pp-recruiter-pending-title">We&apos;re reviewing your company</h2>
          <p className="pp-recruiter-pending-lead">
            You&apos;ll be able to search interview-ready talent once an admin approves your
            recruiter account.
          </p>
        </div>

        <div className="pp-glass-card pp-recruiter-pending-card">
          <div className="pp-recruiter-pending-row">
            <span className="pp-recruiter-pending-label">Company</span>
            <span className="pp-recruiter-pending-value">{profile.company ?? "—"}</span>
          </div>
          <div className="pp-recruiter-pending-row">
            <span className="pp-recruiter-pending-label">Work email</span>
            <span className="pp-recruiter-pending-value">{profile.email}</span>
          </div>
          <div className="pp-recruiter-pending-row pp-recruiter-pending-row--last">
            <span className="pp-recruiter-pending-label">Status</span>
            <span className="pp-recruiter-pending-status">
              <span className="pp-recruiter-pending-status-dot" aria-hidden />
              Awaiting admin approval
            </span>
          </div>
        </div>

        <p className="pp-recruiter-pending-footnote">Usually reviewed within 1 business day.</p>

        {!profile.emailVerified ? (
          <Link href="/verify-email/pending" className="pp-recruiter-pending-action">
            <Button variant="secondary">Verify your email</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
