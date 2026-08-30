'use client';

import { useEffect, useState } from 'react';

// Small "N new since you last checked" pill, shown next to the link to
// /admin/challenges on other admin pages. Visiting /admin/challenges
// resets the count to zero (see MarkResponsesChecked) — no separate
// dismiss action, and no pill at all when the count is zero.
export function AdminNewResponsesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch('/api/admin/responses-since')
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  if (count <= 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-safety-yellow text-navy font-mono text-xs font-medium">
      {count}
    </span>
  );
}
