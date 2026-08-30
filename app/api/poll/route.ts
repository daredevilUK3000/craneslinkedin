import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/poll?challenge_id=...
// Returns each quick_take with its response count. No option is marked
// correct/incorrect — this is purely "where does the room stand."
export async function GET(req: NextRequest) {
  const challengeId = req.nextUrl.searchParams.get('challenge_id');
  if (!challengeId) {
    return NextResponse.json({ error: 'challenge_id is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Sequential queries, no joins — per this portfolio's Supabase pattern.
  const { data: quickTakes, error: qtErr } = await supabase
    .from('quick_takes')
    .select('id, label, sort_order')
    .eq('challenge_id', challengeId)
    .order('sort_order', { ascending: true });

  if (qtErr) {
    return NextResponse.json({ error: qtErr.message }, { status: 500 });
  }

  const { data: responses, error: respErr } = await supabase
    .from('responses')
    .select('quick_take_id')
    .eq('challenge_id', challengeId)
    .not('quick_take_id', 'is', null);

  if (respErr) {
    return NextResponse.json({ error: respErr.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const r of responses ?? []) {
    if (!r.quick_take_id) continue;
    counts.set(r.quick_take_id, (counts.get(r.quick_take_id) ?? 0) + 1);
  }

  const poll = (quickTakes ?? []).map((qt) => ({
    id: qt.id,
    label: qt.label,
    count: counts.get(qt.id) ?? 0,
  }));

  const total = poll.reduce((sum, p) => sum + p.count, 0);

  return NextResponse.json({ poll, total });
}
