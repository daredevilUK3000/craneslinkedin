// Deliberate design choice, not a placeholder: a full video/photo hero
// behind the challenge card was considered and rejected (load-time risk in
// a LinkedIn in-app browser, fights the mobile-first requirement, competes
// with the spec-plate for attention). This is pure CSS/inline-SVG instead —
// nothing to buffer, nothing that animates, so no prefers-reduced-motion
// handling is needed. Keep this on every player-facing page.
export function CraneMasthead() {
  return (
    <div className="w-full bg-steel">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <svg
          viewBox="0 0 420 100"
          className="w-full h-auto"
          style={{ maxHeight: '6rem' }}
          fill="none"
          stroke="#ECEEE8"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* base pad */}
          <line x1="50" y1="92" x2="90" y2="92" />
          {/* mast */}
          <line x1="70" y1="92" x2="70" y2="12" />
          {/* apex above the jib pivot */}
          <line x1="70" y1="12" x2="70" y2="2" />
          {/* cab */}
          <rect x="74" y="14" width="16" height="10" />
          {/* counter-jib */}
          <line x1="70" y1="12" x2="25" y2="12" />
          {/* counterweight */}
          <rect x="14" y="12" width="14" height="9" />
          {/* main jib */}
          <line x1="70" y1="12" x2="400" y2="12" />
          {/* support cables (the classic tower-crane A-frame) */}
          <line x1="70" y1="2" x2="400" y2="12" />
          <line x1="70" y1="2" x2="25" y2="12" />
          {/* trolley + hoist line */}
          <line x1="310" y1="12" x2="310" y2="55" />
          {/* hook */}
          <path d="M306,55 q0,9 8,9 q8,0 8,-6" />
        </svg>
      </div>
    </div>
  );
}
