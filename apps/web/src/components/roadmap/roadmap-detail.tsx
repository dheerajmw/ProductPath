import type { Roadmap } from "@/data/roadmaps/types/roadmap";
import { RoadmapHero } from "./roadmap-hero";
import { SkillTimeline } from "./skill-timeline";
import { ToolsSection } from "./tools-section";
import { ProjectsSection } from "./projects-section";
import { CareerOutcomes } from "./career-outcomes";
import { InterviewPrepSection } from "./interview-prep-section";
import { LearningPathSection } from "./learning-path-section";

export function RoadmapDetail({ roadmap }: { roadmap: Roadmap }) {
  return (
    <article className="pp-roadmap-detail">
      <RoadmapHero roadmap={roadmap} />
      <SkillTimeline roadmap={roadmap} />
      <LearningPathSection steps={roadmap.learningPath} resources={roadmap.resources} />
      <ToolsSection tools={roadmap.tools} />
      <ProjectsSection projects={roadmap.projects} />
      <CareerOutcomes roadmap={roadmap} />
      <InterviewPrepSection items={roadmap.interviewPrep} />
    </article>
  );
}
