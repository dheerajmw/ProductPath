"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout, Card, CardContent, CardTitle, Input, Button, Alert, Label } from "@productpath/ui";
import { api, ApiError } from "@/lib/api";

export default function RecruiterOnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.recruiterSignup({
        email,
        password,
        company,
        companyDomain: companyDomain || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <PageLayout>
        <Card>
          <CardContent>
            <CardTitle>Check your email</CardTitle>
            <p style={{ marginTop: 12 }}>
              We sent a verification link. After verifying, an admin may need to approve your company
              unless your email domain matches the company domain you provided.
            </p>
            <Button style={{ marginTop: 16 }} onClick={() => router.push("/login")}>
              Go to login
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Card>
        <CardContent>
          <CardTitle>Recruiter signup</CardTitle>
          <p style={{ color: "var(--pp-muted)", marginTop: 8 }}>
            Search interview-ready product talent who opt into discovery.
          </p>
          <form onSubmit={submit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                autoComplete="organization"
              />
            </div>
            <div>
              <Label htmlFor="companyDomain">Company domain (optional, e.g. acme.com)</Label>
              <Input
                id="companyDomain"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
              />
            </div>
            {error ? <Alert variant="error">{error}</Alert> : null}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create recruiter account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
