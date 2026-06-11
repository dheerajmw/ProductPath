"use client";

import { useEffect, useState, type ReactNode } from "react";

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
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="pp-app-shell">
      {navOpen ? (
        <button
          type="button"
          className="pp-app-shell-backdrop"
          aria-label="Close menu"
          onClick={closeNav}
        />
      ) : null}

      <aside
        className={`pp-app-shell-sidebar${navOpen ? " pp-app-shell-sidebar--open" : ""}`}
      >
        <div className="pp-app-shell-sidebar-head">{sidebar}</div>
        {nav ? (
          <nav
            id="pp-app-shell-nav"
            className="pp-app-shell-nav"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) closeNav();
            }}
          >
            {nav}
          </nav>
        ) : null}
      </aside>

      <div className="pp-app-shell-main">
        <header className="pp-app-shell-header">
          <div className="pp-app-shell-header-left">
            {nav ? (
              <button
                type="button"
                className="pp-app-shell-menu-btn"
                aria-expanded={navOpen}
                aria-controls="pp-app-shell-nav"
                aria-label={navOpen ? "Close navigation" : "Open navigation"}
                onClick={() => setNavOpen((open) => !open)}
              >
                <span className="material-symbols-outlined">{navOpen ? "close" : "menu"}</span>
              </button>
            ) : null}
            <h1 className="pp-app-shell-title pp-headline-md">{title ?? "ProductPath"}</h1>
          </div>
          {topBar ? <div className="pp-app-shell-header-actions">{topBar}</div> : null}
        </header>

        <main className="pp-app-shell-content">{children}</main>
      </div>
    </div>
  );
}
