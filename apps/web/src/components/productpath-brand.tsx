import Link from "next/link";

export function ProductPathBrand({
  href = "/",
  size = "md",
}: {
  href?: string;
  size?: "sm" | "md" | "lg";
}) {
  const fontSize = size === "lg" ? "1.5rem" : size === "sm" ? "1rem" : "1.125rem";
  const markSize = size === "lg" ? 44 : size === "sm" ? 32 : 36;

  return (
    <Link
      href={href}
      className="pp-brand"
      style={{ textDecoration: "none", color: "inherit" }}
      aria-label="ProductPath home"
    >
      <span className="pp-brand-mark" style={{ width: markSize, height: markSize }}>
        <span className="material-symbols-outlined" style={{ fontSize: size === "lg" ? 24 : 20 }}>
          route
        </span>
      </span>
      <span className="pp-brand-wordmark" style={{ fontSize }}>
        Product<span className="pp-gradient-text">Path</span>
      </span>
    </Link>
  );
}
