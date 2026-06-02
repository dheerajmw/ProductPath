import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, style, ...props }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <input
        style={{
          fontFamily: "var(--pp-font)",
          padding: "12px 14px",
          borderRadius: "var(--pp-radius-lg)",
          border: `1px solid ${error ? "var(--pp-danger)" : "var(--pp-border)"}`,
          fontSize: "1rem",
          width: "100%",
          boxSizing: "border-box",
          background: "var(--pp-surface-container-low)",
          color: "var(--pp-fg)",
          outline: "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(173, 198, 255, 0.5)";
          e.currentTarget.style.boxShadow = "0 0 8px rgba(59, 130, 246, 0.35)";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "var(--pp-danger)" : "var(--pp-border)";
          e.currentTarget.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <span style={{ color: "var(--pp-danger)", fontSize: "0.875rem" }}>{error}</span>
      ) : null}
    </div>
  );
}
