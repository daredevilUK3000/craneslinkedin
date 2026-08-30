'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PublishToggleButton({
  challengeId,
  status,
  onToggled,
}: {
  challengeId: string;
  status: string;
  // When omitted, refreshes the current route's server-rendered data
  // (see app/admin/challenges/page.tsx). Pass this when the caller keeps
  // its own client-side state instead (see app/admin/generate/page.tsx).
  onToggled?: (challenge: any) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPublished = status === 'published';

  async function handleToggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/challenges/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeId,
          action: isPublished ? 'unpublish' : 'publish',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to update status');
      if (onToggled) {
        onToggled(data.challenge);
      } else {
        router.refresh();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`font-display font-medium tracking-wide px-4 py-2 text-xs uppercase disabled:opacity-50 ${
          isPublished
            ? 'border border-warning-orange text-warning-orange hover:bg-warning-orange hover:text-white'
            : 'bg-navy text-white hover:bg-steel'
        }`}
      >
        {loading ? 'Working…' : isPublished ? 'Unpublish' : 'Publish'}
      </button>
      {error && <p className="text-warning-orange text-xs">{error}</p>}
    </div>
  );
}
