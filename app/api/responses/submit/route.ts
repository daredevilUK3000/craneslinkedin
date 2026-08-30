import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge_id, quick_take_id, free_text, display_name, company } = body;

    if (!challenge_id) {
      return NextResponse.json({ error: 'challenge_id is required' }, { status: 400 });
    }
    if (!quick_take_id && !free_text) {
      return NextResponse.json(
        { error: 'Provide a quick_take_id and/or free_text — at least one response.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Anonymous by default. Only create a user row if a name and/or company
    // was given — both are optional and independent (display_name is
    // nullable so a submitter can give just a company with no name).
    let userId: string | null = null;
    if (display_name || company) {
      const { data: user, error: userErr } = await supabase
        .from('users')
        .insert({ display_name: display_name || null, company: company || null })
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
        source: 'app',
      })
      .select()
      .single();

    if (respErr) throw respErr;

    return NextResponse.json({ response });
  } catch (err: any) {
    console.error('submit-response error', err);
    return NextResponse.json({ error: err.message ?? 'Submission failed' }, { status: 500 });
  }
}
