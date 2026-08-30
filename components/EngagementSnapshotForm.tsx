'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function toIntOrNull(v: string): number | null {
  if (v.trim() === '') return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

export function EngagementSnapshotForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [snapshotDate, setSnapshotDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [impressions, setImpressions] = useState('');
  const [reactions, setReactions] = useState('');
  const [comments, setComments] = useState('');
  const [uniqueCommenters, setUniqueCommenters] = useState('');
  const [groupJoins, setGroupJoins] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/challenges/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          snapshot_date: snapshotDate,
          impressions: toIntOrNull(impressions),
          reactions: toIntOrNull(reactions),
          comments: toIntOrNull(comments),
          unique_commenters: toIntOrNull(uniqueCommenters),
          group_joins: toIntOrNull(groupJoins),
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to log engagement');
      setImpressions('');
      setReactions('');
      setComments('');
      setUniqueCommenters('');
      setGroupJoins('');
      setNotes('');
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
      <span className="spec-label block mb-3">Log Engagement Snapshot</span>

      <label className="spec-label block mb-1">Date</label>
      <input
        type="date"
        value={snapshotDate}
        onChange={(e) => setSnapshotDate(e.target.value)}
        className="w-full border border-cable-grey/40 p-2.5 mb-3 font-body text-sm"
      />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="spec-label block mb-1">Impressions</label>
          <input
            type="number"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
            className="w-full border border-cable-grey/40 p-2.5 font-body text-sm"
          />
        </div>
        <div>
          <label className="spec-label block mb-1">Reactions</label>
          <input
            type="number"
            value={reactions}
            onChange={(e) => setReactions(e.target.value)}
            className="w-full border border-cable-grey/40 p-2.5 font-body text-sm"
          />
        </div>
        <div>
          <label className="spec-label block mb-1">Comments</label>
          <input
            type="number"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full border border-cable-grey/40 p-2.5 font-body text-sm"
          />
        </div>
        <div>
          <label className="spec-label block mb-1">Unique Commenters</label>
          <input
            type="number"
            value={uniqueCommenters}
            onChange={(e) => setUniqueCommenters(e.target.value)}
            className="w-full border border-cable-grey/40 p-2.5 font-body text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="spec-label block mb-1">New Group Joins</label>
          <input
            type="number"
            value={groupJoins}
            onChange={(e) => setGroupJoins(e.target.value)}
            className="w-full border border-cable-grey/40 p-2.5 font-body text-sm"
          />
        </div>
      </div>

      <label className="spec-label block mb-1">Notes (optional)</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. reach outside usual connections, notable commenters, etc."
        className="w-full border border-cable-grey/40 p-2.5 mb-3 font-body text-sm min-h-[60px]"
      />

      {error && <p className="text-warning-orange text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-navy text-white font-display font-medium tracking-wide px-5 py-2.5 text-xs uppercase disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Log Snapshot'}
      </button>
    </form>
  );
}
