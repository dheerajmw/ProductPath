import type { InterviewPrepItem } from "@/data/roadmaps/types/roadmap";

export function InterviewPrepSection({ items }: { items: InterviewPrepItem[] }) {
  return (
    <section className="pp-roadmap-section" aria-labelledby="interview-prep-heading">
      <h2 id="interview-prep-heading" className="pp-roadmap-section-title">
        Interview prep
      </h2>
      <p className="pp-roadmap-section-lead">
        Topics, tips, and sample questions for AI product interviews.
      </p>
      <div className="pp-roadmap-interview-grid">
        {items.map((item) => (
          <article key={item.topic} className="pp-roadmap-interview-card">
            <h3>{item.topic}</h3>
            <ul>
              {item.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            {item.sampleQuestions && item.sampleQuestions.length > 0 && (
              <div className="pp-roadmap-sample-questions">
                <span className="pp-label-caps">Sample questions</span>
                <ul>
                  {item.sampleQuestions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
