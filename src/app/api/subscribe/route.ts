import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, fhrsid, businessName } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await addSubscriber(
      email,
      fhrsid || undefined,
      businessName || undefined,
      'website'
    );

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
    });
  } catch (error: unknown) {
    let message: string;
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      message = JSON.stringify(error);
    } else {
      message = String(error);
    }
    console.error('[Subscribe error]', message);

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.', debug: message },
      { status: 500 }
    );
  }
}
