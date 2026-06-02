"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppShell, Button } from "@productpath/ui";
import { api } from "@/lib/api";
import { invalidateMeCache } from "@/lib/me-cache";
import { ProductPathBrand } from "@/components/productpath-brand";
import { RecruiterSidebarProfile } from "@/components/sidebar-profile";
import type { ReactNode } from "react";

const NAV = [
  { href: "/recruiter/search", label: "Talent search", icon: "person_search" },
  { href: "/recruiter/onboarding", label: "Account", icon: "badge" },
];

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={`pp-nav-link${active ? " pp-nav-link--active" : ""}`}>
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </Link>
  );
}

export function RecruiterShell({
  title = "Recruiter",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <AppShell
      title={title}
      sidebar={
        <div className="pp-sidebar-header">
          <ProductPathBrand href="/recruiter/search" size="md" />
          <RecruiterSidebarProfile />
        </div>
      }
      topBar={
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await api.logout();
            invalidateMeCache();
            router.push("/");
          }}
        >
          Log out
        </Button>
      }
      nav={
        <>
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </>
      }
    >
      {children}
    </AppShell>
  );
}
