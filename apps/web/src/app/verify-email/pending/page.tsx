import { Suspense } from "react";
import Link from "next/link";
import { PageLayout, Card, CardContent, Spinner } from "@productpath/ui";
import { PendingClient } from "./pending-client";

export default function VerifyEmailPendingPage() {
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
            <Suspense
              fallback={
                <div style={{ display: "flex", gap: 12 }}>
                  <Spinner />
                  <span>Loading…</span>
                </div>
              }
            >
              <PendingClient />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
