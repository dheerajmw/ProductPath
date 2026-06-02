import type { ReactNode } from "react";
import { ProductPathBrand } from "@/components/productpath-brand";

export function MarketingShell({
  children,
  headerExtra,
  centered = true,
}: {
  children: ReactNode;
  headerExtra?: ReactNode;
  centered?: boolean;
}) {
  return (
    <div className="pp-marketing-shell">
      <div className="pp-atmospheric pp-atmospheric--primary" aria-hidden />
      <div className="pp-atmospheric pp-atmospheric--secondary" aria-hidden />
      <header className="pp-marketing-header">
        <div className="pp-marketing-header-inner">
          <ProductPathBrand href="/" size="md" />
          {headerExtra}
        </div>
      </header>
      <main
        className={
          centered
            ? "pp-marketing-main pp-marketing-main--centered"
            : "pp-marketing-main pp-marketing-main--wide"
        }
      >
        {children}
      </main>
    </div>
  );
}
