import type { ReactNode } from "react";

export function AppShell({
  title,
  children,
  sidebar,
  nav,
  topBar,
}: {
  title?: string;
  children: ReactNode;
  sidebar?: ReactNode;
  nav?: ReactNode;
  topBar?: ReactNode;
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
      <aside
        style={{
          position: "fixed",
          inset: "0 auto 0 0",
          width: "var(--pp-sidebar-width)",
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          padding: "var(--pp-gutter)",
          background: "var(--pp-surface-container-high)",
          borderRight: "1px solid var(--pp-border)",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: 24 }}>{sidebar}</div>
        {nav ? (
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>{nav}</nav>
        ) : null}
      </aside>

      <div style={{ marginLeft: "var(--pp-sidebar-width)", minHeight: "100vh" }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            height: "var(--pp-header-height)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 var(--pp-gutter)",
            background: "var(--pp-glass)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--pp-border)",
          }}
        >
          <h1
            className="pp-headline-md"
            style={{ margin: 0, fontSize: "1.375rem", letterSpacing: "-0.02em" }}
          >
            {title ?? "ProductPath"}
          </h1>
          {topBar}
        </header>

        <main
          style={{
            maxWidth: "var(--pp-container-max)",
            margin: "0 auto",
            padding: "var(--pp-gutter)",
            paddingTop: 8,
            paddingBottom: 48,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
