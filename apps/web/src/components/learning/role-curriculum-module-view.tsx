"use client";

import Link from "next/link";
import { Alert, Button } from "@productpath/ui";
import {
  getPhaseByModuleSlug,
  topicResourceTitle,
  type CurriculumTopic,
  type RoleCurriculum,
} from "@/data/learning/curriculum";
import { ResourceViewer } from "@/components/resource-viewer";
import { RoleResourceSourceRow } from "@/components/learning/role-resource-source-row";
import type { ModuleDetailResponse, ModuleResource } from "@/lib/api";

function findTopicResource(
  resources: ModuleResource[],
  topic: CurriculumTopic,
): ModuleResource | undefined {
  const title = topicResourceTitle(topic);
  return resources.find((r) => r.title === title);
}

function findLinkResources(
  resources: ModuleResource[],
  topic: CurriculumTopic,
): ModuleResource[] {
  const prefix = `${topic.number}. ${topic.title} — `;
  return resources.filter((r) => r.title.startsWith(prefix));
}

type Props = {
  curriculum: RoleCurriculum;
  data: ModuleDetailResponse;
  busy: string | null;
  onToggleResource: (resourceId: string, completed: boolean) => void;
  onMarkComplete: () => void;
};

export function RoleCurriculumModuleView({
  curriculum,
  data,
  busy,
  onToggleResource,
  onMarkComplete,
}: Props) {
  const phase = getPhaseByModuleSlug(curriculum, data.module.slug);
  if (!phase) return null;

  const requiredDone = data.resources.filter((r) => r.required && r.completed).length;
  const requiredTotal = data.resources.filter((r) => r.required).length;

  return (
    <>
      <div className="pp-pmm-module-header">
        <p className="pp-pmm-module-phase">{phase.title}</p>
        <h2 className="pp-pmm-module-title">{data.module.title}</h2>
        {data.module.description ? (
          <p className="pp-pmm-module-desc">{data.module.description}</p>
        ) : null}
        <div className="pp-pmm-module-progress">
          <span>
            {requiredDone}/{requiredTotal} topics reviewed
          </span>
          {data.module.status === "COMPLETED" ? (
            <span className="pp-pmm-module-badge">Completed</span>
          ) : null}
        </div>
      </div>

      {data.module.locked ? (
        <Alert variant="info">
          Complete prerequisite modules first:{" "}
          {data.prerequisites.map((p) => p.title).join(", ")}
        </Alert>
      ) : null}

      <div className="pp-pmm-topics">
        {phase.topics.map((topic) => {
          const topicResource = findTopicResource(data.resources, topic);
          const linkResources = findLinkResources(data.resources, topic);

          return (
            <section key={topic.id} className="pp-glass-card pp-pmm-topic">
              <div className="pp-pmm-topic-head">
                <span className="pp-pmm-topic-num">{topic.number}</span>
                <h3>{topic.title}</h3>
                {topicResource && !data.module.locked ? (
                  <label className="pp-pmm-topic-check">
                    <input
                      type="checkbox"
                      checked={topicResource.completed}
                      disabled={busy === topicResource.id}
                      onChange={(e) => onToggleResource(topicResource.id, e.target.checked)}
                    />
                    Reviewed
                  </label>
                ) : topicResource?.completed ? (
                  <span className="material-symbols-outlined pp-pmm-topic-done">check_circle</span>
                ) : null}
              </div>

              {topic.learn.length > 0 && (
                <div className="pp-pmm-topic-section">
                  <h4>Learn</h4>
                  <ul>
                    {topic.learn.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {topic.study?.length ? (
                <div className="pp-pmm-topic-section">
                  <h4>Study</h4>
                  <ul className="pp-pmm-resource-url-list">
                    {topic.study.map((item) => (
                      <RoleResourceSourceRow key={item.url} title={item.label} url={item.url} />
                    ))}
                  </ul>
                </div>
              ) : null}

              {topic.build?.length ? (
                <div className="pp-pmm-topic-section">
                  <h4>Build</h4>
                  <ul>
                    {topic.build.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="pp-pmm-topic-section">
                <h4>Resources</h4>
                <ul className="pp-pmm-resource-url-list">
                  {topic.resources.map((link) => (
                    <RoleResourceSourceRow key={link.url} title={link.label} url={link.url} />
                  ))}
                </ul>
              </div>

              {linkResources.length > 0 && (
                <div className="pp-pmm-topic-embeds">
                  {linkResources.map((resource) => (
                    <div key={resource.id} className="pp-pmm-embed">
                      <strong>{resource.title.replace(`${topic.number}. ${topic.title} — `, "")}</strong>
                      <ResourceViewer resource={resource} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {!data.module.locked && data.module.status !== "COMPLETED" ? (
        <div className="pp-pmm-module-footer">
          <Button loading={busy === "complete"} disabled={!data.canComplete} onClick={onMarkComplete}>
            Mark module complete
          </Button>
          {!data.canComplete ? (
            <p>Check off all topics as reviewed to finish this module.</p>
          ) : null}
        </div>
      ) : null}

      <p className="pp-pmm-module-back">
        <Link href="/learn/roadmaps/library">Browse full resource library →</Link>
      </p>
    </>
  );
}

export function isCurriculumModule(curriculum: RoleCurriculum, moduleSlug: string): boolean {
  return Boolean(getPhaseByModuleSlug(curriculum, moduleSlug));
}
