"use client";

type Props = {
  question: string;
  context?: string;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
};

export function ScenarioQuestion({ question, context, options, selectedIndex, onSelect }: Props) {
  return (
    <div className="pp-mvp-scenario">
      {context ? <p className="pp-mvp-scenario-context">{context}</p> : null}
      <h3>{question}</h3>
      <ul className="pp-mvp-options">
        {options.map((opt, i) => (
          <li key={opt}>
            <button
              type="button"
              className={`pp-mvp-option${selectedIndex === i ? " pp-mvp-option--selected" : ""}`}
              onClick={() => onSelect(i)}
            >
              <span className="pp-mvp-option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
