import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
              description: `Personalised food hygiene improvement plan for ${businessName || 'your business'}`,
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
        businessName: businessName || '',
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&fhrsid=${fhrsid}`,
      cancel_url: `${baseUrl}/check/${fhrsid}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
