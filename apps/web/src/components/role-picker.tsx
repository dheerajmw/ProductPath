"use client";

import type { CSSProperties } from "react";
import { Button, Alert } from "@productpath/ui";
import type { ProductRole } from "@/lib/api";

const ROLE_META: Record<
  string,
  { icon: string; accent: string; tagline: string }
> = {
  "product-management": {
    icon: "lightbulb",
    accent: "var(--pp-primary)",
    tagline: "Strategy & delivery",
  },
  "product-design": {
    icon: "palette",
    accent: "var(--pp-tertiary)",
    tagline: "Experience & systems",
  },
  "product-analytics": {
    icon: "analytics",
    accent: "var(--pp-secondary)",
    tagline: "Data-driven decisions",
  },
  "product-marketing": {
    icon: "campaign",
    accent: "#ffb86c",
    tagline: "Positioning & GTM",
  },
  "product-operations": {
    icon: "hub",
    accent: "#a8b4ff",
    tagline: "Scale & execution",
  },
};

function roleMeta(slug: string) {
  return (
    ROLE_META[slug] ?? {
      icon: "work",
      accent: "var(--pp-primary)",
      tagline: "Product discipline",
    }
  );
}

export function RolePicker({
  roles,
  activeRoleId,
  submitting,
  confirmRoleId,
  error,
  onSelect,
  onConfirmSwitch,
  onCancelSwitch,
}: {
  roles: ProductRole[];
  activeRoleId: string | null;
  submitting: string | null;
  confirmRoleId: string | null;
  error: string | null;
  onSelect: (roleId: string) => void;
  onConfirmSwitch: () => void;
  onCancelSwitch: () => void;
}) {
  return (
    <div className="pp-role-picker">
      {error ? (
        <div style={{ marginBottom: 16 }}>
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      {confirmRoleId ? (
        <div className="pp-role-picker-confirm">
          <Alert variant="info">
            Switching roles archives learning progress for your current role. You can review it
            later, but your active path resets for the new role.
          </Alert>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button loading={Boolean(submitting)} onClick={onConfirmSwitch}>
              Confirm switch
            </Button>
            <Button variant="secondary" onClick={onCancelSwitch}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="pp-role-grid" role="list">
        {roles.map((role) => {
          const meta = roleMeta(role.slug);
          const isActive = activeRoleId === role.id;
          const isLoading = submitting === role.id;

          return (
            <button
              key={role.id}
              type="button"
              role="listitem"
              className={`pp-role-card${isActive ? " pp-role-card--active" : ""}`}
              style={{ "--pp-role-accent": meta.accent } as CSSProperties}
              disabled={Boolean(submitting)}
              onClick={() => onSelect(role.id)}
              aria-pressed={isActive}
            >
              <span className="pp-role-card-icon" aria-hidden>
                <span className="material-symbols-outlined">{meta.icon}</span>
              </span>
              <span className="pp-role-card-body">
                <span className="pp-role-card-header">
                  <span className="pp-role-card-title">{role.name}</span>
                  {isActive ? <span className="pp-pill pp-pill--success">Active</span> : null}
                </span>
                <span className="pp-role-card-tagline">{meta.tagline}</span>
                {role.description ? (
                  <span className="pp-role-card-desc">{role.description}</span>
                ) : null}
              </span>
              <span className="pp-role-card-action">
                <span className={`pp-role-card-cta${isLoading ? " pp-role-card-cta--loading" : ""}`}>
                  {isActive ? "Continue" : activeRoleId ? "Switch" : "Select"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
