import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateChallenge, ChallengeFormat } from '@/lib/ai/generate-challenge';

// NOTE: this route only ever creates a challenge with status='draft'.
// Publishing is a separate, explicit admin action — see /api/challenges/publish
// and the toggle in /admin/challenges (or directly on this page's result panel).
// This enforces "AI never auto-publishes" from the handoff doc's non-negotiable rules.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const format = body.format as ChallengeFormat;
    const category: string | undefined = body.category;
    const tone: string | undefined = body.tone;

    if (!format) {
      return NextResponse.json({ error: 'format is required' }, { status: 400 });
    }

    const generated = await generateChallenge({ format, category, tone });

    const supabase = createAdminClient();

    // Sequential queries per this portfolio's Supabase pattern — no joins.
    const { data: countRow, error: countErr } = await supabase
      .from('challenges')
      .select('challenge_number')
      .order('challenge_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (countErr) throw countErr;

    const nextNumber = (countRow?.challenge_number ?? 0) + 1;
    const slug = `challenge-${nextNumber}`;

    const { data: challenge, error: insertErr } = await supabase
      .from('challenges')
      .insert({
        challenge_number: nextNumber,
        slug,
        title: generated.title,
        scenario: generated.scenario,
        question: generated.question,
        format,
        category: category ?? null,
        status: 'draft',
        linkedin_post_draft: generated.linkedin_post_draft,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    if (generated.quick_takes?.length) {
      const rows = generated.quick_takes.map((label, i) => ({
        challenge_id: challenge.id,
        label,
        sort_order: i,
      }));
      const { error: qtErr } = await supabase.from('quick_takes').insert(rows);
      if (qtErr) throw qtErr;
    }

    return NextResponse.json({ challenge, quick_takes: generated.quick_takes });
  } catch (err: any) {
    console.error('generate-challenge error', err);
    return NextResponse.json({ error: err.message ?? 'Generation failed' }, { status: 500 });
  }
}
