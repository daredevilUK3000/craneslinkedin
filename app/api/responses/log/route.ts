import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Admin-only (see middleware.ts). Manually records a standout LinkedIn
// comment as a `responses` row (source: 'linkedin_comment') so it can be
// highlighted and pulled into the recap draft. Automated comment ingestion
// is explicitly out of scope per the handoff — this is the deliberate
// human-in-the-loop substitute: the admin reads the LinkedIn thread and
// transcribes what's worth surfacing.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge_id, display_name, free_text, quick_take_id, highlighted } = body;

    if (!challenge_id) {
      return NextResponse.json({ error: 'challenge_id is required' }, { status: 400 });
    }
    if (!free_text && !quick_take_id) {
      return NextResponse.json(
        { error: 'Provide free_text and/or quick_take_id.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let userId: string | null = null;
    if (display_name) {
      const { data: user, error: userErr } = await supabase
        .from('users')
        .insert({ display_name })
        .select('id')
        .single();
      if (userErr) throw userErr;
      userId = user.id;
    }

    const { data: response, error: respErr } = await supabase
      .from('responses')
      .insert({
        challenge_id,
        user_id: userId,
        quick_take_id: quick_take_id ?? null,
        free_text: free_text ?? null,
        source: 'linkedin_comment',
        highlighted: Boolean(highlighted),
      })
      .select()
      .single();

    if (respErr) throw respErr;

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error('log-linkedin-comment error', err);
    return NextResponse.json({ error: err.message ?? 'Failed to log comment' }, { status: 500 });
  }
}
