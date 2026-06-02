"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageLayout, Card, CardContent, CardTitle, CardDescription, Label, Input, Button, Alert } from "@productpath/ui";
import { adminApi, ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user } = await adminApi.login({ email, password });
      if (user.platformRole !== "ADMIN") {
        await adminApi.logout();
        setError("This account does not have admin access.");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 420, margin: "48px auto" }}>
        <Card>
          <CardContent>
            <CardTitle>Admin console</CardTitle>
            <CardDescription>ProductPath operations and configuration.</CardDescription>
            <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {error ? <Alert variant="error">{error}</Alert> : null}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" loading={loading}>
                Log in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
