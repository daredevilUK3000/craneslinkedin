import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Admin-only (see middleware.ts). Powers the "N new since you last
// checked" badge — see AdminNewResponsesBadge.
export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: activity, error: activityErr } = await supabase
      .from('admin_activity')
      .select('last_checked_responses_at')
      .eq('id', true)
      .single();
    if (activityErr) throw activityErr;

    const since = activity.last_checked_responses_at;

    const { count, error: countErr } = await supabase
      .from('responses')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', since);
    if (countErr) throw countErr;

    return NextResponse.json({ count: count ?? 0, since });
  } catch (err: any) {
    console.error('responses-since error', err);
    return NextResponse.json({ error: err.message ?? 'Failed to check for new responses' }, { status: 500 });
  }
}
