"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@productpath/ui";
import { api, type ModuleDetailResponse, type RoadmapModule, type RoadmapResponse } from "@/lib/api";
import { getRoadmapBySlug } from "@/data/roadmaps";
import {
  getCurriculumForRole,
  getPhaseByModuleSlug,
  hasCurriculum,
  topicResourceTitle,
} from "@/data/learning/curriculum";

const TIMELINE_ICONS = [
  "menu_book",
  "search",
  "rocket_launch",
  "insights",
  "account_tree",
  "verified_user",
] as const;

function timelineIcon(mod: RoadmapModule, index: number): string {
  const slugIcons: Record<string, string> = {
    "pm-foundations": "menu_book",
    "ai-pm": "psychology",
    "pm-execution-interviews": "rocket_launch",
    "design-foundations": "menu_book",
    "ai-product-design": "palette",
    "design-portfolio-interviews": "folder_special",
    "analytics-foundations": "insights",
    "ai-analytics": "science",
    "analytics-portfolio-interviews": "monitoring",
    "ops-foundations": "hub",
    "ai-ops": "smart_toy",
    "ops-portfolio-interviews": "verified_user",
    "pmm-foundations": "campaign",
    "growth-distribution": "trending_up",
    "ai-pmm": "psychology",
    "analytics-metrics": "insights",
    "pmm-tools": "build",
    "pmm-portfolio": "folder_special",
    "pmm-interview": "quiz",
  };
  return slugIcons[mod.slug] ?? TIMELINE_ICONS[index % TIMELINE_ICONS.length] ?? "school";
}

function shortLabel(title: string): string {
  const word = title.split(/\s+/)[0] ?? title;
  return word.length > 12 ? word.slice(0, 11) : word;
}

function nodeState(
  mod: RoadmapModule,
  index: number,
  modules: RoadmapModule[],
): "completed" | "active" | "locked" | "available" {
  if (mod.status === "COMPLETED") return "completed";
  if (mod.locked) return "locked";
  const firstOpen = modules.findIndex((m) => !m.locked && m.status !== "COMPLETED");
  if (firstOpen === index || mod.status === "IN_PROGRESS") return "active";
  return "available";
}

function findDefaultModuleId(modules: RoadmapModule[]): string | null {
  if (modules.length === 0) return null;
  const inProgress = modules.find((m) => m.status === "IN_PROGRESS" && !m.locked);
  if (inProgress) return inProgress.id;
  const next = modules.find((m) => !m.locked && m.status !== "COMPLETED");
  if (next) return next.id;
  return modules[modules.length - 1]?.id ?? null;
}

function masteryLevel(percent: number): string {
  if (percent >= 80) return "L5 PRINCIPAL";
  if (percent >= 65) return "L4 STAFF";
  if (percent >= 50) return "L3 SENIOR ASSOCIATE";
  if (percent >= 30) return "L2 ASSOCIATE";
  if (percent >= 10) return "L1 FOUNDATIONS";
  return "L0 STARTER";
}

function formatSalary(min: number, max: number): string {
  return `$${Math.round((min + max) / 2 / 1000)}k`;
}

type Props = {
  data: RoadmapResponse;
};

export function RoleRoadmapOs({ data }: Props) {
  const modules = useMemo(
    () => [...data.modules].sort((a, b) => a.sortOrder - b.sortOrder),
    [data.modules],
  );
  const [selectedId, setSelectedId] = useState<string | null>(() => findDefaultModuleId(modules));
  const [moduleDetail, setModuleDetail] = useState<ModuleDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const selectedModule =
    modules.find((m) => m.id === selectedId) ?? modules.find((m) => m.id === findDefaultModuleId(modules));

  const careerMeta = getRoadmapBySlug(`ai-${data.role.slug}`);
  const curriculum = getCurriculumForRole(data.role.slug);
  const topicCount = curriculum?.phases.reduce((sum, p) => sum + p.topics.length, 0) ?? 0;
  const completedCount = data.progress.completedModules;
  const totalCount = data.progress.totalModules;
  const moduleIndex = selectedModule ? modules.findIndex((m) => m.id === selectedModule.id) + 1 : 0;

  useEffect(() => {
    if (!selectedModule || selectedModule.locked) {
      setModuleDetail(null);
      return;
    }
    setDetailLoading(true);
    api
      .getModule(selectedModule.id)
      .then(setModuleDetail)
      .catch(() => setModuleDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedModule?.id, selectedModule?.locked]);

  const completedModules = modules.filter((m) => m.status === "COMPLETED");

  return (
    <div className="pp-role-roadmap-os">
      <header className="pp-role-roadmap-os-header">
        <div>
          <h1 className="pp-role-roadmap-os-title">{data.roadmap.title}</h1>
          <div className="pp-role-roadmap-os-meta">
            <span className="pp-role-roadmap-os-meta-item">
              <span className="material-symbols-outlined">check_circle</span>
              {completedCount}/{totalCount} modules complete
            </span>
            <span className="pp-role-roadmap-os-meta-dot" aria-hidden />
            <span className="pp-role-roadmap-os-meta-item">
              <span className="material-symbols-outlined">trending_up</span>
              {masteryLevel(data.progress.percent)}
            </span>
          </div>
        </div>
        <div className="pp-role-roadmap-os-mastery pp-glass-card">
          <div className="pp-role-roadmap-os-mastery-head">
            <span className="pp-label-caps">Role mastery</span>
            <strong>{data.progress.percent}%</strong>
          </div>
          <div className="pp-role-roadmap-os-mastery-bar">
            <div style={{ width: `${data.progress.percent}%` }} />
          </div>
        </div>
      </header>

      <div className="pp-role-roadmap-os-grid">
        <nav className="pp-role-roadmap-os-timeline" aria-label="Learning path">
          <div className="pp-role-roadmap-os-timeline-line" aria-hidden />
          {modules.map((mod, index) => {
            const state = nodeState(mod, index, modules);
            const isSelected = selectedModule?.id === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                className={`pp-role-roadmap-os-node pp-role-roadmap-os-node--${state}${isSelected ? " pp-role-roadmap-os-node--selected" : ""}`}
                disabled={mod.locked}
                onClick={() => !mod.locked && setSelectedId(mod.id)}
                aria-current={isSelected ? "step" : undefined}
              >
                {state === "active" ? <span className="pp-role-roadmap-os-node-glow" aria-hidden /> : null}
                <span className="pp-role-roadmap-os-node-circle">
                  <span className="material-symbols-outlined">{timelineIcon(mod, index)}</span>
                </span>
                <span className="pp-role-roadmap-os-node-label">{shortLabel(mod.title)}</span>
              </button>
            );
          })}
        </nav>

        <div className="pp-role-roadmap-os-main">
          {selectedModule ? (
            <section className="pp-role-roadmap-os-focus pp-glass-card">
              <span className="pp-role-roadmap-os-focus-watermark material-symbols-outlined" aria-hidden>
                {timelineIcon(selectedModule, moduleIndex - 1)}
              </span>
              <div className="pp-role-roadmap-os-focus-inner">
                <div className="pp-role-roadmap-os-focus-head">
                  <div>
                    <span className="pp-label-caps pp-role-roadmap-os-kicker">Current focus</span>
                    <h2>{selectedModule.title}</h2>
                  </div>
                  <span className="pp-role-roadmap-os-module-badge">
                    Module {moduleIndex}/{totalCount}
                  </span>
                </div>
                <p className="pp-role-roadmap-os-focus-desc">
                  {selectedModule.description ?? data.roadmap.description}
                </p>

                {selectedModule.locked ? (
                  <p className="pp-role-roadmap-os-locked-msg">
                    Complete{" "}
                    {selectedModule.prerequisites.map((p) => p.title).join(", ") || "prior modules"}{" "}
                    to unlock.
                  </p>
                ) : detailLoading ? (
                  <p className="pp-body-muted">Loading resources…</p>
                ) : (
                  <div className="pp-role-roadmap-os-resource-grid">
                    {(() => {
                      const phase = curriculum
                        ? getPhaseByModuleSlug(curriculum, selectedModule.slug)
                        : undefined;
                      if (phase) {
                        return phase.topics.slice(0, 4).map((topic) => {
                          const title = topicResourceTitle(topic);
                          const resource = moduleDetail?.resources.find((r) => r.title === title);
                          const isDone = resource?.completed ?? false;
                          const isCurrent =
                            !isDone &&
                            moduleDetail?.resources
                              .filter((r) => r.required)
                              .find((r) => !r.completed)?.title === title;
                          return (
                            <div
                              key={topic.id}
                              className={`pp-role-roadmap-os-resource${isCurrent ? " pp-role-roadmap-os-resource--current" : ""}${!isDone && !isCurrent ? " pp-role-roadmap-os-resource--muted" : ""}`}
                            >
                              <div className="pp-role-roadmap-os-resource-head">
                                <strong>{topic.number}. {topic.title}</strong>
                                {isDone ? (
                                  <span className="material-symbols-outlined pp-role-roadmap-os-check">
                                    check_circle
                                  </span>
                                ) : isCurrent ? (
                                  <span className="pp-role-roadmap-os-pulse" aria-hidden />
                                ) : (
                                  <span className="material-symbols-outlined pp-role-roadmap-os-lock">
                                    radio_button_unchecked
                                  </span>
                                )}
                              </div>
                              <p>{topic.learn[0] ?? "Topic"} · Review</p>
                            </div>
                          );
                        });
                      }

                      return (moduleDetail?.resources ?? []).slice(0, 4).map((resource) => {
                      const isDone = resource.completed;
                      const isCurrent =
                        !isDone &&
                        moduleDetail?.resources
                          .filter((r) => r.required)
                          .find((r) => !r.completed)?.id === resource.id;
                      return (
                        <div
                          key={resource.id}
                          className={`pp-role-roadmap-os-resource${isCurrent ? " pp-role-roadmap-os-resource--current" : ""}${!isDone && !isCurrent ? " pp-role-roadmap-os-resource--muted" : ""}`}
                        >
                          <div className="pp-role-roadmap-os-resource-head">
                            <strong>{resource.title}</strong>
                            {isDone ? (
                              <span className="material-symbols-outlined pp-role-roadmap-os-check">
                                check_circle
                              </span>
                            ) : isCurrent ? (
                              <span className="pp-role-roadmap-os-pulse" aria-hidden />
                            ) : (
                              <span className="material-symbols-outlined pp-role-roadmap-os-lock">
                                radio_button_unchecked
                              </span>
                            )}
                          </div>
                          <p>
                            {resource.required ? "Required" : "Optional"} · {resource.type.replace(/_/g, " ")}
                          </p>
                        </div>
                      );
                    });
                    })()}
                    {(moduleDetail?.resources.length ?? 0) === 0 &&
                    !(curriculum && getPhaseByModuleSlug(curriculum, selectedModule.slug)) ? (
                      <div className="pp-role-roadmap-os-resource pp-role-roadmap-os-resource--current">
                        <div className="pp-role-roadmap-os-resource-head">
                          <strong>{selectedModule.title}</strong>
                          <span className="pp-role-roadmap-os-pulse" aria-hidden />
                        </div>
                        <p>
                          {selectedModule.requiredResourcesCompleted}/
                          {selectedModule.requiredResourcesTotal} required resources complete
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                {selectedModule.locked ? (
                  <Button variant="secondary" disabled>
                    Locked
                  </Button>
                ) : (
                  <Link href={`/learn/${selectedModule.id}`}>
                    <Button className="pp-role-roadmap-os-cta">
                      Continue learning
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Button>
                  </Link>
                )}
              </div>
            </section>
          ) : null}

          <div className="pp-role-roadmap-os-stats">
            <div className="pp-glass-card pp-role-roadmap-os-stat-card">
              <h3 className="pp-label-caps">Recent wins</h3>
              <ul className="pp-role-roadmap-os-wins">
                {completedModules.slice(-2).map((mod) => (
                  <li key={mod.id}>
                    <span className="pp-role-roadmap-os-win-icon material-symbols-outlined">
                      military_tech
                    </span>
                    <span>
                      <strong>{mod.title}</strong>
                      <small>Module completed</small>
                    </span>
                  </li>
                ))}
                {completedModules.length === 0 && (
                  <li>
                    <span className="pp-role-roadmap-os-win-icon material-symbols-outlined">bolt</span>
                    <span>
                      <strong>Start your path</strong>
                      <small>Complete your first module</small>
                    </span>
                  </li>
                )}
                {data.progress.percent > 0 && (
                  <li>
                    <span className="pp-role-roadmap-os-win-icon pp-role-roadmap-os-win-icon--streak material-symbols-outlined">
                      bolt
                    </span>
                    <span>
                      <strong>{data.progress.percent}% mastery</strong>
                      <small>Keep the momentum going</small>
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="pp-glass-card pp-role-roadmap-os-stat-card">
              <h3 className="pp-label-caps">Career leap</h3>
              <div className="pp-role-roadmap-os-career">
                <div>
                  <p className="pp-role-roadmap-os-career-value pp-role-roadmap-os-career-value--green">
                    {careerMeta
                      ? formatSalary(
                          careerMeta.meta.salaryRange.min,
                          careerMeta.meta.salaryRange.max,
                        )
                      : "—"}
                  </p>
                  <small>Target avg. salary</small>
                </div>
                <div className="pp-role-roadmap-os-career-right">
                  <p className="pp-role-roadmap-os-career-value">
                    {careerMeta ? `${careerMeta.meta.jobDemandScore * 3}%` : "+—%"}
                  </p>
                  <small>Market demand signal</small>
                </div>
              </div>
            </div>
          </div>

          <div className="pp-role-roadmap-os-links">
            <Link
              href={
                hasCurriculum(data.role.slug)
                  ? "/learn/roadmaps/library"
                  : `/roadmaps/ai-${data.role.slug}`
              }
              className="pp-glass-card pp-role-roadmap-os-link-card"
            >
              <span className="material-symbols-outlined">menu_book</span>
              <strong>Resource library</strong>
              <span>
                {hasCurriculum(data.role.slug)
                  ? `${topicCount} topics · videos, blogs & tools`
                  : "AI career roadmap & guides"}
              </span>
            </Link>
            <Link href="/community" className="pp-glass-card pp-role-roadmap-os-link-card">
              <span className="material-symbols-outlined">groups</span>
              <strong>Mentorship</strong>
              <span>Community & peer support</span>
            </Link>
            <Link href="/opportunities" className="pp-glass-card pp-role-roadmap-os-link-card">
              <span className="material-symbols-outlined">work</span>
              <strong>Job board</strong>
              <span>Matched opportunities</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
