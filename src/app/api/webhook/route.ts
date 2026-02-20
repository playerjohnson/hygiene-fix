import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEstablishment } from '@/lib/fsa-api';
import { generateChecklist } from '@/lib/checklist-generator';
import { generateActionPlanPDF } from '@/lib/pdf-generator';
import { sendActionPlanEmail } from '@/lib/email';
import { createPurchase, completePurchase } from '@/lib/supabase';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutComplete(session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const fhrsid = session.metadata?.fhrsid;
  const email = session.customer_email || session.customer_details?.email;

  if (!fhrsid || !email) {
    console.error('Webhook missing fhrsid or email:', { fhrsid, email, sessionId: session.id });
    return;
  }

  console.log(`Processing payment for FHRSID ${fhrsid}, email ${email}`);

  try {
    // 1. Record purchase in Supabase
    try {
      await createPurchase({
        fhrsid: Number(fhrsid),
        email,
        stripe_session_id: session.id,
        amount_pence: session.amount_total || 4900,
      });
    } catch (dbErr) {
      console.error('Failed to create purchase record (non-fatal):', dbErr);
    }

    // 2. Fetch establishment data from FSA
    const establishment = await getEstablishment(Number(fhrsid));
    if (!establishment) {
      console.error(`Establishment not found for FHRSID ${fhrsid}`);
      // Still mark payment as complete even if we can't generate
      // Customer support can handle manually
      return;
    }

    // 3. Generate personalised checklist via Claude
    console.log(`Generating checklist for ${establishment.BusinessName}...`);
    const checklist = await generateChecklist(establishment);

    // 4. Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await generateActionPlanPDF(establishment, checklist);

    // 5. Send email with PDF attached
    console.log(`Sending action plan to ${email}...`);
    await sendActionPlanEmail({
      to: email,
      businessName: establishment.BusinessName,
      ratingValue: establishment.RatingValue,
      pdfBuffer,
      checklist,
    });

    // 6. Mark purchase as completed
    try {
      await completePurchase(
        session.id,
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || ''
      );
    } catch (dbErr) {
      console.error('Failed to complete purchase record (non-fatal):', dbErr);
    }

    console.log(`✅ Action plan delivered to ${email} for ${establishment.BusinessName}`);
  } catch (error) {
    console.error('Error processing action plan:', error);
    // TODO: Queue for retry or alert for manual intervention
  }
}
