'use client';

export function ShareButton({ challengeUrl, title }: { challengeUrl: string; title: string }) {
  function handleShare() {
    const text = `My take on this week's lift challenge — "${title}". What would you check first?`;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      challengeUrl
    )}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
    // Pre-filled text isn't supported by LinkedIn's share endpoint directly —
    // copy it to the clipboard so it's one paste away.
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  return (
    <button
      onClick={handleShare}
      className="mt-6 border border-navy text-navy font-display font-medium tracking-wide px-6 py-3 text-sm uppercase hover:bg-navy hover:text-white transition-colors"
    >
      Share My Take
    </button>
  );
}
