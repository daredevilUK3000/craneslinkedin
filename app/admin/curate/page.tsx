import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { ResponseHighlightToggle } from '@/components/ResponseHighlightToggle';
import { LogLinkedInCommentForm } from '@/components/LogLinkedInCommentForm';
import { RecapGenerator } from '@/components/RecapGenerator';
import { EngagementSnapshotForm } from '@/components/EngagementSnapshotForm';
import { LogoutButton } from '@/components/LogoutButton';
import { AdminNewResponsesBadge } from '@/components/AdminNewResponsesBadge';

// Static route with a query param (?slug=challenge-1), matching the
// portfolio's Windows Git convention — see app/challenge/view/page.tsx.
// force-dynamic for the same reason as the other admin pages: this must
// reflect highlight toggles and newly logged comments immediately.
export const dynamic = 'force-dynamic';

interface ResponseRow {
  id: string;
  user_id: string | null;
  quick_take_id: string | null;
  free_text: string | null;
  source: string;
  highlighted: boolean;
  created_at: string;
}

export default async function AdminCuratePage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  const slug = searchParams.slug;
  if (!slug) notFound();

  const supabase = createAdminClient();

  // Sequential queries, no joins — per this portfolio's Supabase pattern.
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, challenge_number, title, question')
    .eq('slug', slug)
    .maybeSingle();

  if (!challenge) notFound();

  const { data: quickTakes } = await supabase
    .from('quick_takes')
    .select('id, label')
    .eq('challenge_id', challenge.id)
    .order('sort_order', { ascending: true });

  const { data: responses } = await supabase
    .from('responses')
    .select('id, user_id, quick_take_id, free_text, source, highlighted, created_at')
    .eq('challenge_id', challenge.id)
    .order('created_at', { ascending: false });

  const userIds = [...new Set((responses ?? []).map((r) => r.user_id).filter(Boolean))] as string[];
  const usersById = new Map<string, { display_name: string | null; company: string | null }>();
  if (userIds.length) {
    const { data: users } = await supabase
      .from('users')
      .select('id, display_name, company')
      .in('id', userIds);
    for (const u of users ?? []) usersById.set(u.id, { display_name: u.display_name, company: u.company });
  }

  const quickTakeLabelById = new Map((quickTakes ?? []).map((qt) => [qt.id, qt.label]));

  const highlighted = (responses ?? []).filter((r) => r.highlighted);
  const rest = (responses ?? []).filter((r) => !r.highlighted);

  const { data: engagementSnapshots } = await supabase
    .from('engagement_snapshots')
    .select('id, snapshot_date, impressions, reactions, comments, unique_commenters, group_joins, notes')
    .eq('challenge_id', challenge.id)
    .order('snapshot_date', { ascending: false });

  return (
    <main className="min-h-screen bg-paper px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between mb-2 gap-4">
          <div className="min-w-0">
            <span className="spec-label block mb-2">Admin — Curate · No. {challenge.challenge_number}</span>
            <h1 className="font-display font-semibold text-2xl text-navy">{challenge.title}</h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="/admin/challenges"
              className="flex items-center gap-2 border border-navy text-navy font-display font-medium tracking-wide px-4 py-2 text-xs uppercase hover:bg-navy hover:text-white transition-colors"
            >
              All Challenges
              <AdminNewResponsesBadge />
            </a>
            <LogoutButton />
          </div>
        </div>
        <p className="font-body text-sm text-cable-grey mb-8">{challenge.question}</p>

        <span className="spec-label block mb-3">Highlighted ({highlighted.length})</span>
        <div className="space-y-3 mb-8">
          {highlighted.length === 0 && (
            <p className="text-cable-grey font-body text-sm">None yet.</p>
          )}
          {highlighted.map((r) => (
            <ResponseRowCard
              key={r.id}
              r={r}
              usersById={usersById}
              quickTakeLabelById={quickTakeLabelById}
            />
          ))}
        </div>

        <span className="spec-label block mb-3">All Responses ({rest.length})</span>
        <div className="space-y-3 mb-8">
          {rest.length === 0 && (
            <p className="text-cable-grey font-body text-sm">No other responses.</p>
          )}
          {rest.map((r) => (
            <ResponseRowCard
              key={r.id}
              r={r}
              usersById={usersById}
              quickTakeLabelById={quickTakeLabelById}
            />
          ))}
        </div>

        <div className="mb-8">
          <LogLinkedInCommentForm challengeId={challenge.id} quickTakes={quickTakes ?? []} />
        </div>

        <div className="mb-8">
          <RecapGenerator challengeId={challenge.id} />
        </div>

        <span className="spec-label block mb-3">Engagement</span>
        {engagementSnapshots && engagementSnapshots.length > 0 && (
          <div className="overflow-x-auto mb-4 border border-cable-grey/40 bg-white">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-cable-grey/30 text-left">
                  <th className="p-2 spec-label">Date</th>
                  <th className="p-2 spec-label">Impr.</th>
                  <th className="p-2 spec-label">React.</th>
                  <th className="p-2 spec-label">Comments</th>
                  <th className="p-2 spec-label">Uniq.</th>
                  <th className="p-2 spec-label">Joins</th>
                  <th className="p-2 spec-label">Notes</th>
                </tr>
              </thead>
              <tbody>
                {engagementSnapshots.map((s) => (
                  <tr key={s.id} className="border-b border-cable-grey/20 last:border-0">
                    <td className="p-2 text-navy whitespace-nowrap">{s.snapshot_date}</td>
                    <td className="p-2 text-navy">{s.impressions ?? '—'}</td>
                    <td className="p-2 text-navy">{s.reactions ?? '—'}</td>
                    <td className="p-2 text-navy">{s.comments ?? '—'}</td>
                    <td className="p-2 text-navy">{s.unique_commenters ?? '—'}</td>
                    <td className="p-2 text-navy">{s.group_joins ?? '—'}</td>
                    <td className="p-2 text-cable-grey">{s.notes ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <EngagementSnapshotForm challengeId={challenge.id} />
      </div>
    </main>
  );
}

function ResponseRowCard({
  r,
  usersById,
  quickTakeLabelById,
}: {
  r: ResponseRow;
  usersById: Map<string, { display_name: string | null; company: string | null }>;
  quickTakeLabelById: Map<string, string>;
}) {
  const user = r.user_id ? usersById.get(r.user_id) : null;
  const name = user?.display_name || 'Anonymous';
  const company = user?.company;
  const stance = r.quick_take_id ? quickTakeLabelById.get(r.quick_take_id) : null;

  return (
    <div className="flex items-start justify-between gap-4 border border-cable-grey/40 bg-white p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="spec-label">
            {name}
            {company && ` — ${company}`}
          </span>
          <span className="spec-label text-cable-grey">
            {r.source === 'linkedin_comment' ? 'LinkedIn' : 'App'}
          </span>
        </div>
        {stance && <p className="font-body text-sm text-navy font-medium mb-1">{stance}</p>}
        {r.free_text && <p className="font-body text-sm text-navy">{r.free_text}</p>}
      </div>
      <ResponseHighlightToggle responseId={r.id} highlighted={r.highlighted} />
    </div>
  );
}
