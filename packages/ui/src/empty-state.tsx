import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="pp-glass-card"
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "var(--pp-muted)",
      }}
    >
      <h3 className="pp-headline-md" style={{ margin: "0 0 8px", fontSize: "1.125rem" }}>
        {title}
      </h3>
      {description ? <p className="pp-body-muted" style={{ margin: "0 0 16px" }}>{description}</p> : null}
      {action}
    </div>
  );
}
