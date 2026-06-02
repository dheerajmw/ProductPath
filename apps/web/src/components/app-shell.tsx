"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppShell, Button } from "@productpath/ui";
import { api } from "@/lib/api";
import { invalidateMeCache } from "@/lib/me-cache";
import { ProductPathBrand } from "@/components/productpath-brand";
import { CandidateSidebarProfile } from "@/components/sidebar-profile";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Command Center", icon: "dashboard" },
  { href: "/learn", label: "My Roadmaps", icon: "map" },
  { href: "/assessments", label: "Assessments", icon: "quiz" },
  { href: "/projects", label: "Projects", icon: "folder_special" },
  { href: "/profile", label: "Verification", icon: "verified" },
  { href: "/opportunities", label: "Opportunities", icon: "mail" },
  { href: "/community", label: "Community", icon: "forum" },
  { href: "/settings/discovery", label: "Discovery", icon: "public" },
  { href: "/settings/account", label: "Settings", icon: "settings" },
];

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <Link href={href} className={`pp-nav-link${active ? " pp-nav-link--active" : ""}`}>
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </Link>
  );
}

export function CandidateAppShell({
  title = "Command Center",
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
          <ProductPathBrand href="/dashboard" size="md" />
          <CandidateSidebarProfile />
        </div>
      }
      nav={
        <>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </>
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
    >
      {children}
    </AppShell>
  );
}
