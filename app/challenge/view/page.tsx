import { createAdminClient } from '@/lib/supabase/admin';
import { ScenarioCard } from '@/components/ScenarioCard';
import { QuickTakePoll } from '@/components/QuickTakePoll';
import { ShareButton } from '@/components/ShareButton';
import { notFound } from 'next/navigation';

// Static route with a query param (?slug=challenge-1) rather than a
// dynamic [slug] folder — matches the portfolio's established Windows
// Git convention (see /topics/dev-environment).
//
// force-dynamic: Next.js caches fetch() calls by default, including the
// ones supabase-js makes internally — without this, a challenge edited or
// published after the first request could keep serving stale cached data.
export const dynamic = 'force-dynamic';

export default async function ChallengeViewPage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  const slug = searchParams.slug;
  if (!slug) notFound();

  const supabase = createAdminClient();

  // Sequential queries, no joins — per the portfolio's Supabase pattern.
  const { data: challenge } = await supabase
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!challenge) notFound();

  const { data: quickTakes } = await supabase
    .from('quick_takes')
    .select('id, label, sort_order')
    .eq('challenge_id', challenge.id)
    .order('sort_order', { ascending: true });

  const pollRes = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/poll?challenge_id=${challenge.id}`,
    { cache: 'no-store' }
  );
  const pollData = await pollRes.json();

  const challengeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/challenge/view?slug=${slug}`;

  return (
    <main className="min-h-screen bg-paper px-4 py-10 md:py-16">
      <div className="max-w-xl mx-auto">
        <ScenarioCard
          challengeNumber={challenge.challenge_number}
          category={challenge.category}
          scenario={challenge.scenario}
          question={challenge.question}
          disclaimer={challenge.disclaimer}
        />

        <QuickTakePoll
          challengeId={challenge.id}
          quickTakes={quickTakes ?? []}
          initialPoll={pollData.poll ?? []}
          initialTotal={pollData.total ?? 0}
        />

        <ShareButton challengeUrl={challengeUrl} title={challenge.title} />
      </div>
    </main>
  );
}
