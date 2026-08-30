import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Admin-only (see middleware.ts). Called when the admin opens
// /admin/challenges — viewing that list counts as "checked," resetting
// the new-responses badge to zero. No separate dismiss action.
export async function POST() {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('admin_activity')
      .update({ last_checked_responses_at: new Date().toISOString() })
      .eq('id', true);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('mark-checked error', err);
    return NextResponse.json({ error: err.message ?? 'Failed to mark checked' }, { status: 500 });
  }
}
