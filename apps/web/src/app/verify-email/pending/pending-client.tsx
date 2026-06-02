"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CardTitle, CardDescription, Button, Alert } from "@productpath/ui";
import { api } from "@/lib/api";

export function PendingClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const initialDevUrl = searchParams.get("devVerifyUrl") ?? "";
  const [devVerifyUrl, setDevVerifyUrl] = useState(initialDevUrl);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!email) return;
    setLoading(true);
    try {
      const result = await api.resendVerification(email);
      setSent(true);
      if (result.devVerifyUrl) {
        setDevVerifyUrl(result.devVerifyUrl);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CardTitle>Check your email</CardTitle>
      <CardDescription>
        {devVerifyUrl
          ? "Local development: no real email is sent unless Resend is configured. Use the link below to verify."
          : `We sent a verification link to ${email || "your address"}. If you use Resend (RESEND_API_KEY), check your inbox.`}
      </CardDescription>

      {devVerifyUrl ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="success">
            <p style={{ margin: "0 0 8px" }}>Verification link (development)</p>
            <a href={devVerifyUrl} style={{ wordBreak: "break-all" }}>
              {devVerifyUrl}
            </a>
          </Alert>
        </div>
      ) : null}

      {sent && !devVerifyUrl ? (
        <div style={{ marginTop: 16 }}>
          <Alert variant="success">If an account exists, a new email has been sent.</Alert>
        </div>
      ) : null}

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button variant="secondary" loading={loading} onClick={resend} disabled={!email}>
          Resend email
        </Button>
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
      </div>
    </>
  );
}
