import { Suspense } from "react";
import Link from "next/link";
import { Spinner } from "@productpath/ui";
import { MarketingShell } from "@/components/marketing-shell";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return (
    <MarketingShell
      headerExtra={
        <Link href="/" className="pp-label-caps" style={{ color: "var(--pp-muted)" }}>
          Back to home
        </Link>
      }
    >
      <Suspense
        fallback={
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner size={32} />
          </div>
        }
      >
        <LoginClient />
      </Suspense>
    </MarketingShell>
  );
}
