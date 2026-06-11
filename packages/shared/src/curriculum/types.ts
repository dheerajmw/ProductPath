export type CurriculumTopic = {
  id: string;
  number: number;
  title: string;
  learn: string[];
  study?: { label: string; url: string }[];
  build?: string[];
  resources: { label: string; url: string; type?: "video" | "article" | "tool" }[];
};

export type CurriculumPhase = {
  id: string;
  title: string;
  order: number;
  moduleSlug: string;
  moduleTitle: string;
  moduleDescription: string;
  topics: CurriculumTopic[];
};

export type RoleCurriculum = {
  roleSlug: string;
  title: string;
  phases: CurriculumPhase[];
  youtubeChannels: { title: string; url: string }[];
  blogs: { title: string; url: string }[];
  careerStrategy: string[];
  hiringCompanies: string[];
};

export type CurriculumSeedResource = {
  title: string;
  type: "ARTICLE" | "VIDEO" | "EXTERNAL_LINK";
  content?: string;
  url?: string;
  required: boolean;
  sortOrder: number;
};

export type CurriculumSeedModule = {
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  prerequisites: string[];
  resources: CurriculumSeedResource[];
};

export type CurriculumResourceEntry = {
  label: string;
  url: string;
  source: string;
  type?: "video" | "article" | "tool";
};

export function topicResourceTitle(topic: CurriculumTopic): string {
  return `${topic.number}. ${topic.title}`;
}

export function topicArticleContent(topic: CurriculumTopic): string {
  const lines: string[] = [];
  if (topic.learn.length > 0) {
    lines.push("Learn:");
    lines.push(...topic.learn.map((item) => `• ${item}`));
  }
  if (topic.study?.length) {
    lines.push("", "Study:");
    lines.push(...topic.study.map((item) => `• ${item.label}: ${item.url}`));
  }
  if (topic.build?.length) {
    lines.push("", "Build:");
    lines.push(...topic.build.map((item) => `• ${item}`));
  }
  return lines.join("\n");
}

export function resourceTypeForUrl(
  url: string,
  hint?: "video" | "article" | "tool",
): "VIDEO" | "EXTERNAL_LINK" {
  if (hint === "video" || url.includes("youtube.com") || url.includes("youtu.be")) {
    return "VIDEO";
  }
  return "EXTERNAL_LINK";
}

export function getPhaseByModuleSlug(
  curriculum: RoleCurriculum,
  moduleSlug: string,
): CurriculumPhase | undefined {
  return curriculum.phases.find((p) => p.moduleSlug === moduleSlug);
}

export function getAllCurriculumResources(curriculum: RoleCurriculum): CurriculumResourceEntry[] {
  const seen = new Set<string>();
  const entries: CurriculumResourceEntry[] = [];

  const add = (entry: CurriculumResourceEntry) => {
    const key = entry.url.trim().toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(entry);
  };

  for (const phase of curriculum.phases) {
    for (const topic of phase.topics) {
      for (const resource of topic.resources) {
        add({
          label: resource.label,
          url: resource.url,
          source: `${topic.number}. ${topic.title}`,
          type: resource.type,
        });
      }
      for (const item of topic.study ?? []) {
        add({
          label: item.label,
          url: item.url,
          source: `${topic.number}. ${topic.title} (Study)`,
          type: "tool",
        });
      }
    }
  }

  for (const blog of curriculum.blogs) {
    add({
      label: blog.title,
      url: blog.url,
      source: "Best blogs",
      type: "article",
    });
  }

  for (const channel of curriculum.youtubeChannels) {
    add({
      label: channel.title,
      url: channel.url,
      source: "Best YouTube channels",
      type: "video",
    });
  }

  return entries;
}

export function buildSeedModulesFromCurriculum(curriculum: RoleCurriculum): CurriculumSeedModule[] {
  const phases = curriculum.phases;

  return phases.map((phase, index) => {
    const resources: CurriculumSeedResource[] = [];
    let sortOrder = 1;

    for (const topic of phase.topics) {
      resources.push({
        title: topicResourceTitle(topic),
        type: "ARTICLE",
        content: topicArticleContent(topic),
        required: true,
        sortOrder: sortOrder++,
      });

      for (const link of topic.resources) {
        resources.push({
          title: `${topic.number}. ${topic.title} — ${link.label}`,
          type: resourceTypeForUrl(link.url, link.type),
          url: link.url,
          required: false,
          sortOrder: sortOrder++,
        });
      }
    }

    const prevSlug = index > 0 ? phases[index - 1]!.moduleSlug : null;

    return {
      slug: phase.moduleSlug,
      title: phase.moduleTitle,
      description: phase.moduleDescription,
      sortOrder: phase.order,
      prerequisites: prevSlug ? [prevSlug] : [],
      resources,
    };
  });
}
