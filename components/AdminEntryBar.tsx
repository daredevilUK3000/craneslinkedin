import { LogoutButton } from './LogoutButton';

// Small, unobtrusive admin entry point shown on player-facing pages
// (homepage, challenge view) — not the admin nav itself, just a way back
// in. Clicking "Admin" while logged out is handled by middleware.ts,
// which redirects to /admin/login and preserves the destination.
export function AdminEntryBar({ authenticated }: { authenticated: boolean }) {
  return (
    <div className="flex items-center justify-end gap-4 mb-4">
      <a
        href="/admin/challenges"
        className="text-xs font-mono text-cable-grey underline hover:text-navy"
      >
        Admin
      </a>
      {authenticated ? (
        <LogoutButton />
      ) : (
        <a
          href="/admin/login"
          className="text-xs font-mono text-cable-grey underline hover:text-navy"
        >
          Log In
        </a>
      )}
    </div>
  );
}
