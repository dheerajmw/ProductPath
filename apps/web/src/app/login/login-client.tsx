"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { api } from "@/lib/api";

export type LoginRole = "candidate" | "recruiter";

function roleFromParam(value: string | null): LoginRole | null {
  if (value === "candidate" || value === "recruiter") return value;
  return null;
}

export function LoginClient() {
  const searchParams = useSearchParams();
  const initialRole = roleFromParam(searchParams.get("role"));
  const [role, setRole] = useState<LoginRole | null>(initialRole);

  const selectRole = useCallback((next: LoginRole) => {
    setRole(next);
  }, []);

  if (!role) {
    return (
      <>
        <div className="pp-auth-brand">
          <h1 className="pp-headline-md" style={{ margin: 0, color: "var(--pp-primary)" }}>
            ProductPath
          </h1>
          <p className="pp-auth-brand-tagline">Professional OS for product leaders</p>
        </div>

        <div className="pp-role-select-grid">
          <div
            role="button"
            tabIndex={0}
            className="pp-glass-card pp-role-select-card pp-role-select-card--candidate"
            onClick={() => selectRole("candidate")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectRole("candidate");
              }
            }}
          >
            <div className="pp-role-icon-ring pp-role-icon-ring--candidate">
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                psychology
              </span>
            </div>
            <h2 className="pp-headline-md" style={{ margin: "0 0 12px", color: "var(--pp-primary)" }}>
              Product professional
            </h2>
            <p className="pp-body-muted" style={{ margin: "0 0 24px", maxWidth: 320 }}>
              Optimize your career trajectory, track outcomes, and navigate your roadmap with
              precision.
            </p>
            <span className="pp-role-select-cta pp-role-select-cta--primary">Enter platform</span>
          </div>

          <div
            role="button"
            tabIndex={0}
            className="pp-glass-card pp-role-select-card pp-role-select-card--recruiter"
            onClick={() => selectRole("recruiter")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectRole("recruiter");
              }
            }}
          >
            <div className="pp-role-icon-ring pp-role-icon-ring--recruiter">
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                handshake
              </span>
            </div>
            <h2 className="pp-headline-md" style={{ margin: "0 0 12px", color: "var(--pp-secondary)" }}>
              Hiring partner
            </h2>
            <p className="pp-body-muted" style={{ margin: "0 0 24px", maxWidth: 320 }}>
              Access verified performance data and identify elite talent for mission-critical roles.
            </p>
            <span className="pp-role-select-cta pp-role-select-cta--secondary">Access portal</span>
          </div>
        </div>

        <p className="pp-body-muted" style={{ marginTop: 32, textAlign: "center" }}>
          New here?{" "}
          <Link href="/signup" style={{ fontWeight: 600 }}>
            Create an account
          </Link>
          {" · "}
          <Link href="/recruiter/onboarding" style={{ fontWeight: 600 }}>
            Recruiter sign up
          </Link>
        </p>
      </>
    );
  }

  const isRecruiter = role === "recruiter";

  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <button
        type="button"
        onClick={() => setRole(null)}
        className="pp-label-caps"
        style={{
          marginBottom: 24,
          background: "none",
          border: "none",
          color: "var(--pp-muted)",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          arrow_back
        </span>
        Choose role
      </button>

      <div className="pp-glass-card" style={{ padding: 32 }}>
        <h2 className="pp-headline-md" style={{ margin: "0 0 8px" }}>
          {isRecruiter ? "Partner sign in" : "Welcome back"}
        </h2>
        <p className="pp-body-muted" style={{ margin: "0 0 24px" }}>
          {isRecruiter
            ? "Log in to search verified candidates and manage interest requests."
            : "Log in to continue your product career path."}
        </p>
        <AuthForm
          mode="login"
          onSubmit={async (data) => {
            const { user } = await api.login(data);
            return { user };
          }}
        />
        <p className="pp-body-muted" style={{ marginTop: 20, fontSize: "0.875rem" }}>
          New here?{" "}
          <Link href={isRecruiter ? "/recruiter/onboarding" : "/signup"}>
            {isRecruiter ? "Create recruiter account" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
