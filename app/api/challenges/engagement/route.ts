import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Admin-only (see middleware.ts). Logs one row per manual check-in — the
// same fields as the Phase 0 spreadsheet (impressions, reactions, comments,
// unique commenters, group joins), now tracked in-app instead of by hand.
// LinkedIn doesn't expose these numbers via API to a non-partner app, so
// this stays a manual log, not a scrape/pull.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      challenge_id,
      snapshot_date,
      impressions,
      reactions,
      comments,
      unique_commenters,
      group_joins,
      notes,
    } = body;

    if (!challenge_id || !snapshot_date) {
      return NextResponse.json(
        { error: 'challenge_id and snapshot_date are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('engagement_snapshots')
      .insert({
        challenge_id,
        snapshot_date,
        impressions: impressions ?? null,
        reactions: reactions ?? null,
        comments: comments ?? null,
        unique_commenters: unique_commenters ?? null,
        group_joins: group_joins ?? null,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ snapshot: data });
  } catch (err: any) {
    console.error('log-engagement error', err);
    return NextResponse.json({ error: err.message ?? 'Failed to log engagement' }, { status: 500 });
  }
}
