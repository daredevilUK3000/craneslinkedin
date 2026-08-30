import { createAdminClient } from '@/lib/supabase/admin';

// Published challenges change over time (publish/unpublish toggle) — must
// not be statically prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createAdminClient();
  const { data: challenges } = await supabase
    .from('challenges')
    .select('challenge_number, slug, title, question, published_at')
    .eq('status', 'published')
    .order('challenge_number', { ascending: false });

  return (
    <main className="min-h-screen bg-paper px-4 py-10 md:py-16">
      <div className="max-w-xl mx-auto">
        <span className="spec-label block mb-2">Cranes, Cranes, Cranes</span>
        <h1 className="font-display font-semibold text-4xl text-navy mb-8">
          The Lift Challenge
        </h1>

        {(!challenges || challenges.length === 0) && (
          <p className="text-cable-grey font-body">No challenges published yet.</p>
        )}

        <div className="space-y-4">
          {challenges?.map((c) => (
            <a
              key={c.slug}
              href={`/challenge/view?slug=${c.slug}`}
              className="block border border-cable-grey/40 bg-white p-5 hover:border-navy transition-colors"
            >
              <span className="spec-label">Challenge No. {c.challenge_number}</span>
              <p className="font-display font-medium text-xl text-navy mt-1">{c.title}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
