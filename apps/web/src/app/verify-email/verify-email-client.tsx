"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, Spinner } from "@productpath/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { getPostLoginPath } from "@/lib/auth-redirect";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { establishSession } = useAuth();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    api
      .verifyEmail(token)
      .then(async ({ user, sessionToken }) => {
        const verified = await establishSession(user, sessionToken);
        setStatus("success");
        setMessage("Email verified. Redirecting…");
        setTimeout(() => router.replace(getPostLoginPath(verified)), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
      });
  }, [token, router, establishSession]);

  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
        <Spinner />
        <span>Verifying…</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <Alert variant={status === "success" ? "success" : "error"}>{message}</Alert>
    </div>
  );
}
