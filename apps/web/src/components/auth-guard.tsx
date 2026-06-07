"use client";

import type { ReactNode } from "react";
import { Spinner } from "@productpath/ui";
import { useRequireAuth } from "@/hooks/use-require-auth";

export function AuthLoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 48,
        minHeight: "40vh",
      }}
    >
      <Spinner size={32} />
      <span className="pp-body-muted">{label}</span>
    </div>
  );
}

export function RequireAuth({
  children,
  loginSource = "RequireAuth",
  fallback,
}: {
  children: ReactNode;
  loginSource?: string;
  fallback?: ReactNode;
}) {
  const { user, loading, ready } = useRequireAuth({ loginSource });

  if (loading || !ready) {
    return fallback ?? <AuthLoadingScreen label="Checking session…" />;
  }

  if (!user) return null;

  return children;
}
