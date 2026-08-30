import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateRecap, RecapHighlight } from '@/lib/ai/generate-recap';

// Admin-only (see middleware.ts). Drafts the midweek highlights recap post
// from whatever responses are currently marked highlighted — never
// persisted, same "generate, review, copy" pattern as the original
// challenge's linkedin_post_draft.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge_id } = body;

    if (!challenge_id) {
      return NextResponse.json({ error: 'challenge_id is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: challenge, error: challengeErr } = await supabase
      .from('challenges')
      .select('title, question')
      .eq('id', challenge_id)
      .single();
    if (challengeErr) throw challengeErr;

    // Sequential queries, no joins — per this portfolio's Supabase pattern.
    const { data: responses, error: respErr } = await supabase
      .from('responses')
      .select('id, user_id, quick_take_id, free_text, source')
      .eq('challenge_id', challenge_id)
      .eq('highlighted', true);
    if (respErr) throw respErr;

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { error: 'Mark at least one response as highlighted first.' },
        { status: 400 }
      );
    }

    const userIds = [...new Set(responses.map((r) => r.user_id).filter(Boolean))] as string[];
    const quickTakeIds = [
      ...new Set(responses.map((r) => r.quick_take_id).filter(Boolean)),
    ] as string[];

    const usersById = new Map<string, { display_name: string | null; company: string | null }>();
    if (userIds.length) {
      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('id, display_name, company')
        .in('id', userIds);
      if (usersErr) throw usersErr;
      for (const u of users ?? []) usersById.set(u.id, { display_name: u.display_name, company: u.company });
    }

    const quickTakesById = new Map<string, string>();
    if (quickTakeIds.length) {
      const { data: quickTakes, error: qtErr } = await supabase
        .from('quick_takes')
        .select('id, label')
        .in('id', quickTakeIds);
      if (qtErr) throw qtErr;
      for (const qt of quickTakes ?? []) quickTakesById.set(qt.id, qt.label);
    }

    const highlights: RecapHighlight[] = responses.map((r) => {
      const user = r.user_id ? usersById.get(r.user_id) : null;
      return {
        displayName: user?.display_name ?? null,
        company: user?.company ?? null,
        quickTakeLabel: r.quick_take_id ? quickTakesById.get(r.quick_take_id) ?? null : null,
        freeText: r.free_text,
        source: r.source as 'app' | 'linkedin_comment',
      };
    });

    const recap = await generateRecap({
      challengeTitle: challenge.title,
      question: challenge.question,
      highlights,
    });

    return NextResponse.json(recap);
  } catch (err: any) {
    console.error('generate-recap error', err);
    return NextResponse.json({ error: err.message ?? 'Recap generation failed' }, { status: 500 });
  }
}
