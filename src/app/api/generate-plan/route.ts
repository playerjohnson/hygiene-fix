import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEstablishment } from '@/lib/fsa-api';
import { generateChecklist } from '@/lib/checklist-generator';
import { generateActionPlanPDF } from '@/lib/pdf-generator';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    // 1. Verify payment with Stripe
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 });
    }

    const fhrsid = session.metadata?.fhrsid;
    if (!fhrsid) {
      return NextResponse.json({ error: 'Missing FHRSID in session' }, { status: 400 });
    }

    // 2. Fetch establishment from FSA
    const establishment = await getEstablishment(Number(fhrsid));
    if (!establishment) {
      return NextResponse.json({ error: 'Business not found in FSA register' }, { status: 404 });
    }

    // 3. Generate checklist via Claude
    const checklist = await generateChecklist(establishment);

    // 4. Generate PDF
    const pdfBuffer = await generateActionPlanPDF(establishment, checklist);

    // 5. Return PDF as download
    const safeName = establishment.BusinessName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="HygieneFix-Action-Plan-${safeName}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate action plan: ${message}` }, { status: 500 });
  }
}
