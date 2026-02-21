import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { fhrsid } = await request.json();

    if (!fhrsid || typeof fhrsid !== 'number') {
      return NextResponse.json({ error: 'Invalid fhrsid' }, { status: 400 });
    }

    const supabase = getSupabase();

    const { error } = await supabase
      .from('hf_establishments')
      .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
      .eq('fhrsid', fhrsid);

    if (error) {
      console.error('Unsubscribe error:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
