import { Suspense } from "react";
import Link from "next/link";
import { PageLayout, Card, CardContent, CardTitle, Spinner } from "@productpath/ui";
import { VerifyEmailClient } from "./verify-email-client";

export default function VerifyEmailPage() {
  return (
    <PageLayout
      header={
        <Link href="/" style={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}>
          ProductPath
        </Link>
      }
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Card>
          <CardContent>
            <CardTitle>Verify your email</CardTitle>
            <Suspense
              fallback={
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <Spinner />
                  <span>Loading…</span>
                </div>
              }
            >
              <VerifyEmailClient />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
