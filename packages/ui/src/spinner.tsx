export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        border: "2px solid var(--pp-surface-variant)",
        borderTopColor: "var(--pp-primary)",
        borderRadius: "50%",
        animation: "pp-spin 0.7s linear infinite",
      }}
    />
  );
}
