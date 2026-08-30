'use client';

import { useState } from 'react';

export function RecapGenerator({ challengeId }: { challengeId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recap, setRecap] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setRecap(null);
    try {
      const res = await fetch('/api/challenges/recap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Recap generation failed');
      setRecap(data.recap_post_draft);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="spec-plate">
      <span className="corner-tl" aria-hidden="true" />
      <span className="corner-br" aria-hidden="true" />
      <div className="flex items-center justify-between mb-4 gap-4">
        <span className="spec-label">Highlights Recap</span>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-navy text-white font-display font-medium tracking-wide px-4 py-2 text-xs uppercase disabled:opacity-50 shrink-0"
        >
          {loading ? 'Generating…' : recap ? 'Regenerate' : 'Generate Recap'}
        </button>
      </div>

      {error && <p className="text-warning-orange text-sm mb-3">{error}</p>}

      {recap && (
        <pre className="whitespace-pre-wrap font-body text-sm bg-paper p-4 border border-cable-grey/30">
          {recap}
        </pre>
      )}
      {!recap && !error && (
        <p className="text-cable-grey text-sm font-body">
          Mark at least one response as highlighted, then generate a draft recap post quoting
          them.
        </p>
      )}
    </div>
  );
}
