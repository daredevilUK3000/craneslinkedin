'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ResponseHighlightToggle({
  responseId,
  highlighted,
}: {
  responseId: string;
  highlighted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch('/api/responses/highlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_id: responseId, highlighted: !highlighted }),
      });
      if (!res.ok) throw new Error('Failed to update');
      router.refresh();
    } catch {
      // best-effort — row just won't flip; admin can retry the click
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`shrink-0 font-display font-medium tracking-wide px-3 py-1.5 text-xs uppercase disabled:opacity-50 ${
        highlighted
          ? 'bg-safety-yellow text-navy'
          : 'border border-cable-grey/40 text-cable-grey hover:border-navy hover:text-navy'
      }`}
    >
      {loading ? '…' : highlighted ? '★ Highlighted' : 'Highlight'}
    </button>
  );
}
