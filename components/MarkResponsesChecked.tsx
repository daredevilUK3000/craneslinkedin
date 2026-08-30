'use client';

import { useEffect } from 'react';

// Renders nothing — fires once on mount to reset the new-responses badge.
// Placed on /admin/challenges: opening that list is what counts as
// "checked," per design (no separate dismiss action).
export function MarkResponsesChecked() {
  useEffect(() => {
    fetch('/api/admin/mark-checked', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}
