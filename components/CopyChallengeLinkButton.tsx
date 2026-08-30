'use client';

import { useState } from 'react';

export function CopyChallengeLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/challenge/view?slug=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API can fail (permissions, non-secure context) — button just won't flip to "Copied!"
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-mono text-cable-grey underline hover:text-navy"
    >
      {copied ? 'Copied!' : 'Copy Challenge Link'}
    </button>
  );
}
