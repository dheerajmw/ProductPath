import type { HTMLAttributes, ReactNode } from "react";

export type ListCardStatus = "default" | "active" | "completed" | "locked" | "success";

export function ListCardGrid({
  children,
  className,
  as: Tag = "ul",
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode; as?: "ul" | "div" }) {
  return (
    <Tag className={`pp-list-card-grid${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </Tag>
  );
}

export function ListCard({
  title,
  description,
  hint,
  action,
  status = "default",
  icon,
  as: Tag = "li",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  description?: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
  status?: ListCardStatus;
  icon?: ReactNode;
  as?: "li" | "div";
}) {
  const statusClass =
    status === "default" ? "" : ` pp-list-card--${status}`;

  return (
    <Tag
      className={`pp-list-card${statusClass}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {icon ? <span className="pp-list-card-icon">{icon}</span> : null}
      <span className="pp-list-card-body">
        <span className="pp-list-card-title">{title}</span>
        {description ? <span className="pp-list-card-meta">{description}</span> : null}
        {hint ? <span className="pp-list-card-hint">{hint}</span> : null}
      </span>
      {action ? <span className="pp-list-card-action">{action}</span> : null}
    </Tag>
  );
}
