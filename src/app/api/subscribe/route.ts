import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, fhrsid, businessName } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const subscriber = await addSubscriber(
      email,
      fhrsid || undefined,
      businessName || undefined,
      'website'
    );

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
      id: subscriber?.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Subscribe error]', message);

    // Return the actual error in dev/debug, generic in production
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.', debug: message },
      { status: 500 }
    );
  }
}
