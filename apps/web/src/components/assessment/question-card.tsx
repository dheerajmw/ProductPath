"use client";

import type { MvpQuestionView } from "@/lib/api";
import { MCQQuestion } from "./mcq-question";
import { ScenarioQuestion } from "./scenario-question";

type Props = {
  question: MvpQuestionView;
  selectedIndex: number | null;
  textAnswer: string;
  onSelectIndex: (index: number) => void;
  onTextChange: (value: string) => void;
};

export function QuestionCard({
  question,
  selectedIndex,
  textAnswer,
  onSelectIndex,
  onTextChange,
}: Props) {
  return (
    <article className="pp-glass-card pp-mvp-question-card">
      <div className="pp-mvp-question-meta">
        <span className="pp-label-caps">{question.type.replace("-", " ")}</span>
        <span>{question.skillTag.replace(/-/g, " ")}</span>
      </div>

      {question.type === "scenario" ? (
        <ScenarioQuestion
          question={question.question}
          context={question.context}
          options={question.options ?? []}
          selectedIndex={selectedIndex}
          onSelect={onSelectIndex}
        />
      ) : question.type === "mcq" ? (
        <MCQQuestion
          question={question.question}
          options={question.options ?? []}
          selectedIndex={selectedIndex}
          onSelect={onSelectIndex}
        />
      ) : (
        <div className="pp-mvp-short-answer">
          <h3>{question.question}</h3>
          <textarea
            className="pp-mvp-textarea"
            rows={5}
            value={textAnswer}
            placeholder="Write a concise answer…"
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
      )}
    </article>
  );
}
