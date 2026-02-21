import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEstablishment } from '@/lib/fsa-api';
import { checkAnthropicHealth } from '@/lib/preflight';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { fhrsid, businessName, email } = await request.json();

    if (!fhrsid) {
      return NextResponse.json({ error: 'Missing FHRSID' }, { status: 400 });
    }

    // ── Pre-flight checks: verify we can deliver before taking money ──

    // 1. Check establishment exists in FSA register
    const establishment = await getEstablishment(Number(fhrsid));
    if (!establishment) {
      return NextResponse.json(
        { error: 'Business not found in the FSA register. Please search again.' },
        { status: 404 }
      );
    }

    // 2. Check Anthropic API is available (has credits, key valid)
    const aiHealth = await checkAnthropicHealth();
    if (!aiHealth.ok) {
      console.error(`Checkout blocked — AI preflight failed: ${aiHealth.reason}`);
      return NextResponse.json(
        { error: aiHealth.reason },
        { status: 503 }
      );
    }

    // ── All checks passed — create Stripe checkout session ──

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'HygieneFix Action Plan',
              description: `Personalised food hygiene improvement plan for ${establishment.BusinessName}`,
              metadata: {
                fhrsid: String(fhrsid),
              },
            },
            unit_amount: 4900, // £49.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        fhrsid: String(fhrsid),
        businessName: establishment.BusinessName,
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&fhrsid=${fhrsid}`,
      cancel_url: `${baseUrl}/check/${fhrsid}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
