import { NextRequest, NextResponse } from 'next/server';

// For MVP, store in-memory (replace with Supabase later)
const subscribers: { email: string; fhrsid?: string; timestamp: string }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { email, fhrsid } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Store subscriber (MVP: in-memory, production: Supabase)
    subscribers.push({
      email,
      fhrsid,
      timestamp: new Date().toISOString(),
    });

    console.log(`[Subscribe] ${email} for FHRSID: ${fhrsid || 'general'}`);

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
