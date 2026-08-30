'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogLinkedInCommentForm({
  challengeId,
  quickTakes,
}: {
  challengeId: string;
  quickTakes: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [freeText, setFreeText] = useState('');
  const [quickTakeId, setQuickTakeId] = useState('');
  const [highlighted, setHighlighted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/responses/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          display_name: displayName.trim() || null,
          company: company.trim() || null,
          free_text: freeText.trim() || null,
          quick_take_id: quickTakeId || null,
          highlighted,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to log comment');
      setDisplayName('');
      setCompany('');
      setFreeText('');
      setQuickTakeId('');
      setHighlighted(true);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="spec-plate">
      <span className="corner-tl" aria-hidden="true" />
      <span className="corner-br" aria-hidden="true" />
      <span className="spec-label block mb-3">Log a LinkedIn Comment</span>

      <label className="spec-label block mb-1">Commenter Name (optional)</label>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="e.g. Jordan P."
        className="w-full border border-cable-grey/40 p-2.5 mb-3 font-body text-sm"
      />

      <label className="spec-label block mb-1">Commenter Company (optional)</label>
      <input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="e.g. Acme Cranes Ltd"
        className="w-full border border-cable-grey/40 p-2.5 mb-3 font-body text-sm"
      />

      {quickTakes.length > 0 && (
        <>
          <label className="spec-label block mb-1">Matching Quick Take (optional)</label>
          <select
            value={quickTakeId}
            onChange={(e) => setQuickTakeId(e.target.value)}
            className="w-full border border-cable-grey/40 p-2.5 mb-3 font-body text-sm"
          >
            <option value="">— none —</option>
            {quickTakes.map((qt) => (
              <option key={qt.id} value={qt.id}>
                {qt.label}
              </option>
            ))}
          </select>
        </>
      )}

      <label className="spec-label block mb-1">Comment Text</label>
      <textarea
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder="Paste or transcribe their comment"
        className="w-full border border-cable-grey/40 p-2.5 mb-3 font-body text-sm min-h-[80px]"
      />

      <label className="flex items-center gap-2 mb-4 font-body text-sm text-navy">
        <input
          type="checkbox"
          checked={highlighted}
          onChange={(e) => setHighlighted(e.target.checked)}
        />
        Mark as highlighted
      </label>

      {error && <p className="text-warning-orange text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-navy text-white font-display font-medium tracking-wide px-5 py-2.5 text-xs uppercase disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Log Comment'}
      </button>
    </form>
  );
}
