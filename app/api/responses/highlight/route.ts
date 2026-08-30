import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Admin-only (see middleware.ts). Toggles responses.highlighted — the only
// mutation this app makes to that column, and the input to the recap draft.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { response_id, highlighted } = body;

    if (!response_id || typeof highlighted !== 'boolean') {
      return NextResponse.json(
        { error: 'response_id and a boolean highlighted are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('responses')
      .update({ highlighted })
      .eq('id', response_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ response: data });
  } catch (err: any) {
    console.error('highlight-response error', err);
    return NextResponse.json({ error: err.message ?? 'Update failed' }, { status: 500 });
  }
}
