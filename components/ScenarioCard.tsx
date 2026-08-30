interface ScenarioCardProps {
  challengeNumber: number;
  category: string | null;
  scenario: string;
  question: string;
  disclaimer: string;
}

export function ScenarioCard({
  challengeNumber,
  category,
  scenario,
  question,
  disclaimer,
}: ScenarioCardProps) {
  return (
    <div className="spec-plate">
      <span className="corner-tl" aria-hidden="true" />
      <span className="corner-br" aria-hidden="true" />

      <div className="flex items-baseline justify-between mb-6">
        <span className="spec-label">Challenge No. {challengeNumber}</span>
        {category && <span className="spec-label">{category}</span>}
      </div>

      <p className="font-body text-navy text-base leading-relaxed mb-8">{scenario}</p>

      <h1 className="font-display font-semibold text-3xl md:text-4xl text-navy leading-tight mb-6">
        {question}
      </h1>

      <p className="text-xs text-cable-grey font-body border-t border-cable-grey/30 pt-4 mt-8">
        {disclaimer}
      </p>
      <p className="text-xs text-cable-grey font-body mt-2">
        Later this week, we&apos;ll highlight a few responses that stood out or sparked real
        debate — editorial picks, not a scoreboard.
      </p>
    </div>
  );
}
