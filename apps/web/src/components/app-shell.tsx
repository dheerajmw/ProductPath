"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppShell, Button } from "@productpath/ui";
import { useAuth } from "@/lib/auth-context";
import { ProductPathBrand } from "@/components/productpath-brand";
import { CandidateSidebarProfile } from "@/components/sidebar-profile";
import type { ReactNode } from "react";

type NavItem = { href: string; label: string; icon: string };

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Command Center", icon: "dashboard" },
  { href: "/projects", label: "Project submissions", icon: "folder_special" },
  { href: "/assessment", label: "Skill assessment", icon: "quiz" },
  { href: "/gaps", label: "Skill gaps", icon: "analytics" },
  { href: "/profile", label: "Verification", icon: "verified" },
];

const PREP_NAV: NavItem[] = [
  { href: "/learn", label: "Prepare to learn", icon: "school" },
  { href: "/learn/roadmaps", label: "Role roadmaps", icon: "map" },
];

const NETWORK_NAV: NavItem[] = [
  { href: "/opportunities", label: "Opportunities", icon: "mail" },
  { href: "/community", label: "Community", icon: "forum" },
  { href: "/settings/discovery", label: "Discovery", icon: "public" },
  { href: "/settings/account", label: "Settings", icon: "settings" },
];

function isRoadmapsActive(pathname: string) {
  if (pathname === "/learn/roadmaps") return true;
  if (pathname.startsWith("/learn/") && pathname !== "/learn") {
    const rest = pathname.slice("/learn/".length);
    return rest.length > 0 && !rest.includes("/");
  }
  return false;
}

function NavLink({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  let active = false;

  if (href === "/learn") {
    active = pathname === "/learn";
  } else if (href === "/learn/roadmaps") {
    active = isRoadmapsActive(pathname);
  } else {
    active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
  }

  return (
    <Link href={href} className={`pp-nav-link${active ? " pp-nav-link--active" : ""}`}>
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </Link>
  );
}

function NavSection({ label }: { label: string }) {
  return <span className="pp-nav-section-label">{label}</span>;
}

export function CandidateAppShell({
  title = "Command Center",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();

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
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <NavSection label="Optional — learn before assessment" />
          {PREP_NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <NavSection label="Network & settings" />
          {NETWORK_NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </>
      }
      topBar={
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await logout();
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
