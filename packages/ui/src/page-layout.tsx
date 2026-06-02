import type { ReactNode } from "react";

/** Centered marketing / auth layout (no sidebar). */
export function PageLayout({
  children,
  header,
  fullWidth,
}: {
  children: ReactNode;
  header?: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--pp-bg)",
        fontFamily: "var(--pp-font)",
        color: "var(--pp-fg)",
      }}
    >
      {header ? (
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid var(--pp-border)",
            background: "rgba(14, 19, 35, 0.85)",
            backdropFilter: "blur(16px)",
            padding: "0 var(--pp-gutter)",
            height: "var(--pp-header-height)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ maxWidth: "var(--pp-container-max)", margin: "0 auto", width: "100%" }}>
            {header}
          </div>
        </header>
      ) : null}
      <main
        style={{
          maxWidth: fullWidth ? "none" : "var(--pp-container-max)",
          margin: "0 auto",
          padding: "32px var(--pp-gutter)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
