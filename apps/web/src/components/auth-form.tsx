"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Alert } from "@productpath/ui";
import { normalizeEmail } from "@productpath/shared";
import { api, ApiError, type User } from "@/lib/api";
import { getPostLoginPath } from "@/lib/auth-redirect";
import { invalidateMeCache } from "@/lib/me-cache";

export function AuthForm({
  mode,
  onSubmit,
}: {
  mode: "login" | "signup";
  onSubmit: (data: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<{ devVerifyUrl?: string; user?: User } | void>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      const result = await onSubmit({
        email: normalizedEmail,
        password,
        ...(mode === "signup" ? { displayName: displayName.trim() || undefined } : {}),
      });
      if (mode === "signup") {
        const params = new URLSearchParams({ email: normalizedEmail });
        if (result?.devVerifyUrl) {
          params.set("devVerifyUrl", result.devVerifyUrl);
        }
        router.push(`/verify-email/pending?${params.toString()}`);
      } else if (result?.user) {
        invalidateMeCache();
        router.push(getPostLoginPath(result.user));
      } else {
        const { user } = await api.me();
        invalidateMeCache();
        router.push(getPostLoginPath(user));
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {mode === "signup" ? (
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />
        </div>
      ) : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </div>
      <Button type="submit" loading={loading} style={{ width: "100%" }}>
        {mode === "signup" ? "Create account" : "Log in"}
      </Button>
    </form>
  );
}
