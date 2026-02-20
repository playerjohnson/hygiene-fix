import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, fhrsid, businessName } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Supabase upsert — deduplicates on email
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
    console.error('[Subscribe error]', error);

    // Handle Supabase connection errors gracefully
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('fetch') || message.includes('SUPABASE')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
