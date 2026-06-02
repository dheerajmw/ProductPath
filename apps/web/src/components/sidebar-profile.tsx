"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";
import { fetchMeCached } from "@/lib/me-cache";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function CandidateSidebarProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [statusLabel, setStatusLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const user = await fetchMeCached();
        if (cancelled) return;
        setUser(user);

        const roleId = user.candidateProfile?.activeRoleId;
        if (!roleId) {
          setStatusLabel("Getting started");
          return;
        }

        try {
          const verification = await api.getVerification();
          if (!cancelled) {
            setStatusLabel(verification.stateLabel);
          }
        } catch {
          if (!cancelled) setStatusLabel("Learning");
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="pp-sidebar-profile pp-sidebar-profile--loading" aria-hidden>
        <div className="pp-sidebar-profile-avatar pp-sidebar-profile-skeleton" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="pp-sidebar-profile-skeleton" style={{ height: 14, width: "70%" }} />
          <div className="pp-sidebar-profile-skeleton" style={{ height: 12, width: "50%" }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    user.candidateProfile?.displayName?.trim() || user.email.split("@")[0] || "Member";
  const activeRole = user.candidateProfile?.activeRole;
  const profileHref = activeRole ? "/settings/account" : "/onboarding/role";

  return (
    <Link href={profileHref} className="pp-sidebar-profile">
      <span className="pp-sidebar-profile-avatar" aria-hidden>
        {initials(displayName)}
      </span>
      <span className="pp-sidebar-profile-meta">
        <span className="pp-sidebar-profile-name">{displayName}</span>
        <span className="pp-sidebar-profile-status">{statusLabel || "Learning"}</span>
      </span>
      {activeRole ? (
        <span className="pp-pill pp-pill--primary pp-sidebar-profile-role">{activeRole.name}</span>
      ) : (
        <span className="pp-pill pp-pill--primary pp-sidebar-profile-role">Choose role</span>
      )}
    </Link>
  );
}

export function RecruiterSidebarProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchMeCached()
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="pp-sidebar-profile pp-sidebar-profile--loading" aria-hidden>
        <div className="pp-sidebar-profile-avatar pp-sidebar-profile-skeleton" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="pp-sidebar-profile-skeleton" style={{ height: 14, width: "70%" }} />
          <div className="pp-sidebar-profile-skeleton" style={{ height: 12, width: "50%" }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const company = user.recruiterProfile?.company?.trim();
  const displayName = company || user.email.split("@")[0] || "Recruiter";
  const subtitle = company ? user.email : "Recruiter account";
  const verified = user.recruiterProfile?.verified;

  return (
    <Link href="/recruiter/onboarding" className="pp-sidebar-profile">
      <span className="pp-sidebar-profile-avatar pp-sidebar-profile-avatar--recruiter" aria-hidden>
        {initials(displayName)}
      </span>
      <span className="pp-sidebar-profile-meta">
        <span className="pp-sidebar-profile-name">{displayName}</span>
        <span className="pp-sidebar-profile-status">{subtitle}</span>
      </span>
      <span
        className={`pp-pill ${verified ? "pp-pill--success" : "pp-pill--primary"} pp-sidebar-profile-role`}
      >
        {verified ? "Verified" : "Pending"}
      </span>
    </Link>
  );
}
