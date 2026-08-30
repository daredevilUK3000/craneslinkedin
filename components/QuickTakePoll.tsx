'use client';

import { useState } from 'react';

interface QuickTake {
  id: string;
  label: string;
}

interface PollResult {
  id: string;
  label: string;
  count: number;
}

export function QuickTakePoll({
  challengeId,
  quickTakes,
  initialPoll,
  initialTotal,
}: {
  challengeId: string;
  quickTakes: QuickTake[];
  initialPoll: PollResult[];
  initialTotal: number;
}) {
  const [poll, setPoll] = useState(initialPoll);
  const [total, setTotal] = useState(initialTotal);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selectedId && !freeText.trim()) {
      setError('Pick a quick take and/or add your reasoning below.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/responses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          quick_take_id: selectedId,
          free_text: freeText.trim() || null,
          display_name: displayName.trim() || null,
          company: company.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');

      const pollRes = await fetch(`/api/poll?challenge_id=${challengeId}`);
      const pollData = await pollRes.json();
      setPoll(pollData.poll);
      setTotal(pollData.total);
      setSubmitted(true);
    } catch {
      setError('Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      {!submitted ? (
        <>
          <span className="spec-label block mb-3">Your Quick Take</span>
          <div className="grid gap-2 mb-6">
            {quickTakes.map((qt) => (
              <button
                key={qt.id}
                onClick={() => setSelectedId(qt.id)}
                className={`text-left px-4 py-3 border font-body text-sm transition-colors ${
                  selectedId === qt.id
                    ? 'border-navy bg-safety-yellow text-navy font-medium'
                    : 'border-cable-grey/40 bg-white text-navy hover:border-navy'
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>

          <span className="spec-label block mb-2">Your Reasoning (optional)</span>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Add your take — or drop it as a comment on the LinkedIn post for the real discussion."
            className="w-full border border-cable-grey/40 p-3 text-sm font-body mb-4 min-h-[100px] focus:border-navy"
          />

          <span className="spec-label block mb-2">Your Name (optional)</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="For credit if we highlight your take"
            className="w-full border border-cable-grey/40 p-3 text-sm font-body mb-4 focus:border-navy"
          />

          <span className="spec-label block mb-2">Your Company (optional)</span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="If you'd like it credited alongside your take"
            className="w-full border border-cable-grey/40 p-3 text-sm font-body mb-4 focus:border-navy"
          />

          {error && <p className="text-warning-orange text-sm mb-3">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-navy text-white font-display font-medium tracking-wide px-6 py-3 text-sm uppercase disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit My Take'}
          </button>
        </>
      ) : (
        <div>
          <p className="font-body text-sm text-navy mb-4">
            Thanks — here&apos;s where the room stands so far ({total} response{total === 1 ? '' : 's'}):
          </p>
          <div className="space-y-3">
            {poll.map((p) => {
              const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-xs font-mono text-cable-grey mb-1">
                    <span>{p.label}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 bg-paper border border-cable-grey/30">
                    <div
                      className="h-full bg-safety-yellow poll-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
