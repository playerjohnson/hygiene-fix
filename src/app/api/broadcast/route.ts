import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { renderTemplate, EmailVars } from '@/lib/email-templates';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { template, maxRating = 2, batchSize = 20, dryRun = true } = await request.json();

    if (!template) {
      return NextResponse.json({ error: 'template required (rating_alert, delivery_platform_risk, action_plan_intro, reinspection_guide)' }, { status: 400 });
    }

    // Get businesses that haven't received this template yet
    const supabase = getSupabase();
    const resend = getResend();

    const { data: businesses, error } = await supabase
      .from('hf_establishments')
      .select('fhrsid, business_name, postcode, rating, email, email_sequence')
      .lte('rating', maxRating)
      .not('email', 'is', null)
      .not('unsubscribed', 'is', true)
      .limit(batchSize);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hygienefix.co.uk';
    const results: { fhrsid: number; status: string; error?: string }[] = [];

    for (const biz of businesses || []) {
      // Skip if already sent this template
      const sentTemplates: string[] = biz.email_sequence || [];
      if (sentTemplates.includes(template)) {
        results.push({ fhrsid: biz.fhrsid, status: 'skipped', error: 'already_sent' });
        continue;
      }

      const vars: EmailVars = {
        businessName: biz.business_name,
        rating: biz.rating,
        postcode: biz.postcode,
        fhrsid: biz.fhrsid,
        baseUrl,
      };

      const rendered = renderTemplate(template, vars);
      if (!rendered) {
        results.push({ fhrsid: biz.fhrsid, status: 'error', error: 'invalid_template' });
        continue;
      }

      if (dryRun) {
        results.push({ fhrsid: biz.fhrsid, status: 'dry_run' });
        continue;
      }

      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'HygieneFix <noreply@hygienefix.co.uk>',
          to: biz.email,
          subject: rendered.subject,
          html: rendered.html,
        });

        // Mark as sent
        await supabase
          .from('hf_establishments')
          .update({
            email_sequence: [...sentTemplates, template],
            last_emailed: new Date().toISOString(),
          })
          .eq('fhrsid', biz.fhrsid);

        results.push({ fhrsid: biz.fhrsid, status: 'sent' });
      } catch (err) {
        results.push({ fhrsid: biz.fhrsid, status: 'error', error: err instanceof Error ? err.message : 'unknown' });
      }

      // Rate limit: 100ms between sends
      await new Promise((r) => setTimeout(r, 100));
    }

    const sent = results.filter((r) => r.status === 'sent').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      template,
      dryRun,
      total: results.length,
      sent,
      skipped,
      errors,
      results,
    });
  } catch (err) {
    console.error('Broadcast error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
