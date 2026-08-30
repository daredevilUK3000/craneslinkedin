import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/challenges/publish
// Body: { challenge_id: string, action: 'publish' | 'unpublish' }
//
// This is the only place challenge.status flips to/from 'published' — the
// explicit admin action referenced by /api/challenges/generate's comment
// ("AI never auto-publishes"). Unpublishing returns a challenge to 'draft'
// rather than introducing a separate archived-style state.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge_id, action } = body;

    if (!challenge_id) {
      return NextResponse.json({ error: 'challenge_id is required' }, { status: 400 });
    }
    if (action !== 'publish' && action !== 'unpublish') {
      return NextResponse.json(
        { error: "action must be 'publish' or 'unpublish'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const update =
      action === 'publish'
        ? { status: 'published', published_at: new Date().toISOString() }
        : { status: 'draft' };

    const { data: challenge, error } = await supabase
      .from('challenges')
      .update(update)
      .eq('id', challenge_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ challenge });
  } catch (err: any) {
    console.error('publish-challenge error', err);
    return NextResponse.json({ error: err.message ?? 'Publish failed' }, { status: 500 });
  }
}
