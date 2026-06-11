"use client";

import Link from "next/link";
import {
  getAllCurriculumResources,
  type RoleCurriculum,
} from "@/data/learning/curriculum";
import { RoleResourceSourceRow } from "@/components/learning/role-resource-source-row";

type Props = {
  curriculum: RoleCurriculum;
};

export function RoleResourceLibrary({ curriculum }: Props) {
  const allResources = getAllCurriculumResources(curriculum);
  const topicCount = curriculum.phases.reduce((sum, p) => sum + p.topics.length, 0);

  return (
    <div className="pp-pmm-library">
      <header className="pp-pmm-library-header">
        <p className="pp-label-caps">Resources library</p>
        <h1>{curriculum.title}</h1>
        <p className="pp-pmm-library-sub">
          {topicCount} topics across {curriculum.phases.length} phases — curated videos, blogs, and tools.
        </p>
        <Link href="/learn/roadmaps" className="pp-pmm-library-back">
          ← Back to roadmap
        </Link>
      </header>

      <section className="pp-glass-card pp-pmm-library-extra pp-pmm-library-all-urls">
        <h2>All resource URLs ({allResources.length})</h2>
        <p className="pp-pmm-library-all-urls-desc">
          Every external link used across topics, study products, blogs, and recommended channels.
        </p>
        <ul className="pp-pmm-library-all-urls-list">
          {allResources.map((resource) => (
            <RoleResourceSourceRow
              key={resource.url}
              title={resource.label}
              url={resource.url}
              context={resource.source}
            />
          ))}
        </ul>
      </section>

      <div className="pp-pmm-library-phases">
        {curriculum.phases.map((phase) => (
          <section key={phase.id} className="pp-glass-card pp-pmm-library-phase">
            <div className="pp-pmm-library-phase-head">
              <h2>{phase.title}</h2>
              <Link href="/learn/roadmaps" className="pp-pmm-library-module-link">
                {phase.moduleTitle} module →
              </Link>
            </div>

            <div className="pp-pmm-library-topics">
              {phase.topics.map((topic) => (
                <article key={topic.id} className="pp-pmm-library-topic">
                  <h3>
                    <span>{topic.number}.</span> {topic.title}
                  </h3>

                  {topic.learn.length > 0 && (
                    <div className="pp-pmm-library-block">
                      <h4>Learn</h4>
                      <ul>
                        {topic.learn.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {topic.study?.length ? (
                    <div className="pp-pmm-library-block">
                      <h4>Study</h4>
                      <ul className="pp-pmm-library-links">
                        {topic.study.map((item) => (
                          <RoleResourceSourceRow key={item.url} title={item.label} url={item.url} />
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {topic.build?.length ? (
                    <div className="pp-pmm-library-block">
                      <h4>Build</h4>
                      <ul>
                        {topic.build.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="pp-pmm-library-block">
                    <h4>Resources</h4>
                    <ul className="pp-pmm-library-links">
                      {topic.resources.map((link) => (
                        <RoleResourceSourceRow key={link.url} title={link.label} url={link.url} />
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {curriculum.youtubeChannels.length > 0 && (
        <section className="pp-glass-card pp-pmm-library-extra">
          <h2>Best YouTube channels</h2>
          <ul className="pp-pmm-library-links">
            {curriculum.youtubeChannels.map((channel) => (
              <RoleResourceSourceRow key={channel.url} title={channel.title} url={channel.url} />
            ))}
          </ul>
        </section>
      )}

      {curriculum.blogs.length > 0 && (
        <section className="pp-glass-card pp-pmm-library-extra">
          <h2>Best blogs</h2>
          <ul className="pp-pmm-library-links">
            {curriculum.blogs.map((blog) => (
              <RoleResourceSourceRow key={blog.url} title={blog.title} url={blog.url} />
            ))}
          </ul>
        </section>
      )}

      {curriculum.careerStrategy.length > 0 && (
        <section className="pp-glass-card pp-pmm-library-extra">
          <h2>Career strategy</h2>
          <ol className="pp-pmm-library-strategy">
            {curriculum.careerStrategy.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      {curriculum.hiringCompanies.length > 0 && (
        <section className="pp-glass-card pp-pmm-library-extra">
          <h2>Companies hiring in this space</h2>
          <ul className="pp-pmm-library-tags">
            {curriculum.hiringCompanies.map((company) => (
              <li key={company}>{company}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
