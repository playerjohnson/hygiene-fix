import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEstablishment } from '@/lib/fsa-api';
import { generateChecklist } from '@/lib/checklist-generator';
import { generateActionPlanPDF } from '@/lib/pdf-generator';
import { supabaseAdmin } from '@/lib/supabase';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

const BUCKET = 'action-plans';

async function getCachedPDF(sessionId: string): Promise<Buffer | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(`${sessionId}.pdf`);
    if (error || !data) return null;
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

async function cachePDF(sessionId: string, pdfBuffer: Buffer): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin.storage
      .from(BUCKET)
      .upload(`${sessionId}.pdf`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
  } catch (err) {
    console.error('Failed to cache PDF (non-fatal):', err);
  }
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

    // 2. Check cache first — free, no AI cost
    const cached = await getCachedPDF(sessionId);
    if (cached) {
      console.log(`Cache hit for session ${sessionId}`);
      return new NextResponse(new Uint8Array(cached), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="HygieneFix-Action-Plan.pdf"`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    // 3. Cache miss — generate fresh
    console.log(`Cache miss for session ${sessionId}, generating...`);

    const establishment = await getEstablishment(Number(fhrsid));
    if (!establishment) {
      return NextResponse.json({ error: 'Business not found in FSA register' }, { status: 404 });
    }

    const checklist = await generateChecklist(establishment);
    const pdfBuffer = await generateActionPlanPDF(establishment, checklist);

    // 4. Cache for future downloads (async, non-blocking)
    cachePDF(sessionId, pdfBuffer);

    // 5. Return PDF
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
    const raw = error instanceof Error ? error.message : String(error);

    let message = 'Something went wrong generating your action plan. Please try again.';
    if (raw.includes('credit balance') || raw.includes('billing')) {
      message = 'Our AI service is temporarily unavailable. Your payment is safe — please try downloading again shortly, or contact support for a refund.';
    } else if (raw.includes('overloaded') || raw.includes('rate_limit')) {
      message = 'Our AI service is experiencing high demand. Please wait a moment and try downloading again.';
    } else if (raw.includes('not found') || raw.includes('404')) {
      message = 'Business not found in the FSA register. Please contact support.';
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
