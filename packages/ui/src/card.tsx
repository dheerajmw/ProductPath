import type { HTMLAttributes, ReactNode } from "react";

function CardShell({
  children,
  className,
  style,
  glass = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; glass?: boolean }) {
  return (
    <div
      className={glass ? `pp-glass-card ${className ?? ""}` : className}
      style={
        glass
          ? style
          : {
              background: "var(--pp-surface-container)",
              border: "1px solid var(--pp-border)",
              borderRadius: "var(--pp-radius-lg)",
              ...style,
            }
      }
      {...props}
    >
      {children}
    </div>
  );
}

export function Card(
  props: HTMLAttributes<HTMLDivElement> & { children: ReactNode; glass?: boolean },
) {
  return <CardShell {...props} />;
}

export function CardHeader({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div style={{ padding: "20px 24px 0", ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h2
      className="pp-headline-md"
      style={{ margin: 0, fontSize: "1.25rem", ...style }}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardDescription({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p className="pp-body-muted" style={{ margin: "8px 0 0", ...style }} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div style={{ padding: 24, ...style }} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div style={{ padding: "0 24px 24px", display: "flex", gap: 8, flexWrap: "wrap", ...style }} {...props}>
      {children}
    </div>
  );
}
