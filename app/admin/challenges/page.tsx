import { createAdminClient } from '@/lib/supabase/admin';
import { PublishToggleButton } from '@/components/PublishToggleButton';
import { LogoutButton } from '@/components/LogoutButton';
import { CopyChallengeLinkButton } from '@/components/CopyChallengeLinkButton';

// Admin's challenge list — every status, not just published. Lets the admin
// flip status between 'draft' and 'published' without touching Supabase
// directly (see /api/challenges/publish). Must stay fresh after every
// toggle, so this is dynamic and the admin client forces cache: 'no-store'.
export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  draft: 'text-cable-grey',
  published: 'text-navy',
  archived: 'text-cable-grey',
};

export default async function AdminChallengesPage() {
  const supabase = createAdminClient();

  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('id, challenge_number, slug, title, format, category, status, published_at')
    .order('challenge_number', { ascending: false });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <span className="spec-label block mb-2">Admin</span>
            <h1 className="font-display font-semibold text-3xl text-navy">All Challenges</h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/generate"
              className="border border-navy text-navy font-display font-medium tracking-wide px-4 py-2 text-xs uppercase hover:bg-navy hover:text-white transition-colors"
            >
              Generate New
            </a>
            <LogoutButton />
          </div>
        </div>

        {error && (
          <p className="text-warning-orange text-sm mb-4">Failed to load challenges: {error.message}</p>
        )}

        {!error && (!challenges || challenges.length === 0) && (
          <p className="text-cable-grey font-body">
            No challenges yet — generate one from the button above.
          </p>
        )}

        <div className="space-y-3">
          {challenges?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 border border-cable-grey/40 bg-white p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="spec-label">No. {c.challenge_number}</span>
                  <span className={`spec-label ${STATUS_STYLES[c.status] ?? ''}`}>
                    {c.status}
                  </span>
                  {c.category && <span className="spec-label">{c.category}</span>}
                </div>
                <p className="font-display font-medium text-lg text-navy truncate">{c.title}</p>
                <div className="flex items-center gap-3">
                  {c.status === 'published' && (
                    <>
                      <a
                        href={`/challenge/view?slug=${c.slug}`}
                        className="text-xs font-mono text-cable-grey underline"
                      >
                        /challenge/view?slug={c.slug}
                      </a>
                      <CopyChallengeLinkButton slug={c.slug} />
                    </>
                  )}
                  <a
                    href={`/admin/curate?slug=${c.slug}`}
                    className="text-xs font-mono text-cable-grey underline"
                  >
                    Curate
                  </a>
                </div>
              </div>

              <PublishToggleButton challengeId={c.id} status={c.status} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
