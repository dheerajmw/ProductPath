import type { RoadmapTool } from "@/data/roadmaps/types/roadmap";

export function ToolsSection({ tools }: { tools: RoadmapTool[] }) {
  const byCategory = tools.reduce<Record<string, RoadmapTool[]>>((acc, tool) => {
    const list = acc[tool.category] ?? [];
    list.push(tool);
    acc[tool.category] = list;
    return acc;
  }, {});

  return (
    <section className="pp-roadmap-section" aria-labelledby="tools-heading">
      <h2 id="tools-heading" className="pp-roadmap-section-title">
        Tools
      </h2>
      <p className="pp-roadmap-section-lead">
        Stack you will use while building AI product proof-of-work.
      </p>
      <div className="pp-roadmap-tools-grid">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="pp-roadmap-tools-group">
            <h3 className="pp-roadmap-tools-category">{category}</h3>
            <ul>
              {items.map((tool) => (
                <li key={tool.name}>
                  <strong>{tool.name}</strong>
                  {tool.description && <span>{tool.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
