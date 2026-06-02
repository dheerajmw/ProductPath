"use client";

import type { ModuleResource } from "@/lib/api";

export function ResourceViewer({ resource }: { resource: ModuleResource }) {
  switch (resource.type) {
    case "ARTICLE":
      return (
        <div
          style={{
            padding: 16,
            background: "var(--pp-bg)",
            borderRadius: "var(--pp-radius)",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {resource.content}
        </div>
      );
    case "VIDEO":
      if (resource.url?.includes("youtube.com") || resource.url?.includes("youtu.be")) {
        const embed = resource.url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
        return (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={embed}
              title={resource.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allowFullScreen
            />
          </div>
        );
      }
      return resource.url ? (
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          Open video
        </a>
      ) : null;
    case "PDF":
    case "EXTERNAL_LINK":
      return resource.url ? (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
          Open resource →
        </a>
      ) : (
        <span style={{ color: "var(--pp-muted)" }}>No URL provided</span>
      );
    default:
      return null;
  }
}
