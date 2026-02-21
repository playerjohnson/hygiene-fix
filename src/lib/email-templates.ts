/**
 * Email broadcast templates for HygieneFix
 * Sent via Resend to businesses in the hf_establishments pipeline
 *
 * Sequence:
 * 1. Day 0 — Rating alert (your rating is X, here's what it means)
 * 2. Day 3 — Delivery platform risk (Deliveroo/JustEat removal warning)
 * 3. Day 7 — Action plan intro (what's in the plan, sample preview)
 * 4. Day 14 — Reinspection guide (how to request, costs, timeline)
 */

export interface EmailTemplate {
  subject: string;
  preheader: string;
  body: (vars: EmailVars) => string;
}

export interface EmailVars {
  businessName: string;
  rating: number;
  postcode: string;
  fhrsid: number;
  baseUrl: string;
}

function ratingLabel(rating: number): string {
  const labels: Record<number, string> = {
    0: 'Urgent Improvement Necessary',
    1: 'Major Improvement Necessary',
    2: 'Improvement Necessary',
    3: 'Generally Satisfactory',
  };
  return labels[rating] || 'Improvement Necessary';
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  rating_alert: {
    subject: '{{businessName}} — Your Food Hygiene Rating is {{rating}}/5',
    preheader: 'Here\'s what that means for your business and how to improve it.',
    body: (v) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#0B1B2B;border-radius:12px;padding:32px 24px;color:#ffffff;">
    <p style="color:#38BDF8;font-size:13px;font-weight:600;margin:0 0 8px;">HygieneFix</p>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3;">
      ${escapeHtml(v.businessName)}: Your rating is ${v.rating}/5
    </h1>
    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 16px;">
      The Food Standards Agency lists your business as <strong style="color:#F59E0B;">"${ratingLabel(v.rating)}"</strong>.
      This is visible to every customer who searches your name online.
    </p>

    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 20px;">
      <p style="font-size:13px;color:#94A3B8;margin:0 0 4px;">Your score areas:</p>
      <p style="font-size:13px;color:#ffffff;margin:0;">
        Each inspection covers <strong>hygiene practices</strong>, <strong>premises condition</strong>, and <strong>management documentation</strong>.
        Knowing which area pulled your score down tells you where to focus.
      </p>
    </div>

    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 20px;">
      A rating below 3 affects your business directly — consumer trust drops, delivery platforms may delist you,
      and your local authority will inspect more frequently.
    </p>

    <a href="${v.baseUrl}/check/${v.fhrsid}" style="display:inline-block;background:#38BDF8;color:#0B1B2B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
      See Your Full Score Breakdown →
    </a>

    <p style="font-size:11px;color:#475569;margin:24px 0 0;line-height:1.5;">
      You're receiving this because ${escapeHtml(v.businessName)} is listed on the FSA public register with a rating of ${v.rating}/5.
      Data sourced under the Open Government Licence v3.0.
      <a href="${v.baseUrl}/unsubscribe?fhrsid=${v.fhrsid}" style="color:#475569;">Unsubscribe</a>
    </p>
  </div>
</div>
</body></html>`,
  },

  delivery_platform_risk: {
    subject: 'Is {{businessName}} at risk of losing Deliveroo and Just Eat?',
    preheader: 'Delivery platforms are removing businesses rated below 3.',
    body: (v) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#0B1B2B;border-radius:12px;padding:32px 24px;color:#ffffff;">
    <p style="color:#38BDF8;font-size:13px;font-weight:600;margin:0 0 8px;">HygieneFix</p>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3;">
      Delivery platforms are removing low-rated businesses
    </h1>
    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 16px;">
      Deliveroo, Just Eat, and Uber Eats have all introduced minimum food hygiene rating requirements.
      Businesses rated 0 or 1 face removal — and at a rating of <strong style="color:#F59E0B;">${v.rating}/5</strong>,
      ${escapeHtml(v.businessName)} ${v.rating <= 1 ? 'is likely already affected' : 'is close to the threshold'}.
    </p>

    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 20px;">
      <p style="font-size:13px;color:#EF4444;font-weight:600;margin:0 0 8px;">Revenue at risk</p>
      <p style="font-size:13px;color:#94A3B8;margin:0;">
        For takeaways and restaurants, delivery platforms typically represent 30–50% of total revenue.
        Losing access to these platforms can mean thousands of pounds per month in lost orders.
      </p>
    </div>

    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 20px;">
      The good news: most businesses can improve by 1–2 rating points within 8–12 weeks
      by focusing on the right areas. The key is knowing which improvements to prioritise.
    </p>

    <a href="${v.baseUrl}/check/${v.fhrsid}" style="display:inline-block;background:#38BDF8;color:#0B1B2B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
      Get Your Improvement Plan →
    </a>

    <p style="font-size:11px;color:#475569;margin:24px 0 0;line-height:1.5;">
      Data sourced from the FSA under the Open Government Licence v3.0.
      <a href="${v.baseUrl}/unsubscribe?fhrsid=${v.fhrsid}" style="color:#475569;">Unsubscribe</a>
    </p>
  </div>
</div>
</body></html>`,
  },

  action_plan_intro: {
    subject: 'What\'s in a HygieneFix action plan? (sample inside)',
    preheader: 'See exactly what you get — personalised to your inspection scores.',
    body: (v) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#0B1B2B;border-radius:12px;padding:32px 24px;color:#ffffff;">
    <p style="color:#38BDF8;font-size:13px;font-weight:600;margin:0 0 8px;">HygieneFix</p>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3;">
      Your personalised action plan — what's inside
    </h1>
    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 20px;">
      Every HygieneFix action plan is generated specifically for your business, based on your real
      inspection scores. Here's what ${escapeHtml(v.businessName)} would receive:
    </p>

    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 8px;">
      <p style="font-size:13px;color:#38BDF8;font-weight:600;margin:0;">✓ Priority-ranked improvements</p>
      <p style="font-size:12px;color:#94A3B8;margin:4px 0 0;">Critical items first, then high, medium, and low priority. Focus your time where it matters most.</p>
    </div>
    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 8px;">
      <p style="font-size:13px;color:#38BDF8;font-weight:600;margin:0;">✓ SFBB documentation guidance</p>
      <p style="font-size:12px;color:#94A3B8;margin:4px 0 0;">Step-by-step references to the Safer Food Better Business pack sections that need attention.</p>
    </div>
    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 8px;">
      <p style="font-size:13px;color:#38BDF8;font-weight:600;margin:0;">✓ Allergen & Natasha's Law compliance</p>
      <p style="font-size:12px;color:#94A3B8;margin:4px 0 0;">Current requirements for PPDS labelling, allergen matrices, and staff training.</p>
    </div>
    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 20px;">
      <p style="font-size:13px;color:#38BDF8;font-weight:600;margin:0;">✓ Reinspection preparation</p>
      <p style="font-size:12px;color:#94A3B8;margin:4px 0 0;">How to request a reinspection, typical costs (£150–300), and what to have ready on the day.</p>
    </div>

    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 20px;">
      Want to see what one looks like? We've published a sample action plan you can download:
    </p>

    <a href="${v.baseUrl}/api/sample-plan" style="display:inline-block;background:transparent;color:#38BDF8;font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:8px;border:1px solid #38BDF8;margin:0 8px 8px 0;">
      View Sample Plan (PDF)
    </a>
    <a href="${v.baseUrl}/check/${v.fhrsid}" style="display:inline-block;background:#38BDF8;color:#0B1B2B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
      Get Your Plan — £49 →
    </a>

    <p style="font-size:11px;color:#475569;margin:24px 0 0;line-height:1.5;">
      <a href="${v.baseUrl}/unsubscribe?fhrsid=${v.fhrsid}" style="color:#475569;">Unsubscribe</a>
    </p>
  </div>
</div>
</body></html>`,
  },

  reinspection_guide: {
    subject: 'How to request a food hygiene reinspection (costs & timeline)',
    preheader: 'You can request a new inspection at any time — here\'s how.',
    body: (v) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
  <div style="background:#0B1B2B;border-radius:12px;padding:32px 24px;color:#ffffff;">
    <p style="color:#38BDF8;font-size:13px;font-weight:600;margin:0 0 8px;">HygieneFix</p>
    <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;line-height:1.3;">
      You can request a reinspection now
    </h1>
    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 16px;">
      Many business owners think they have to wait for the next scheduled inspection — which could be
      years away. In reality, you can request a paid reinspection at any time once you've made improvements.
    </p>

    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 8px;">
      <p style="font-size:13px;color:#ffffff;margin:0;"><strong>Cost:</strong> £150–300 (set by your local authority)</p>
    </div>
    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 8px;">
      <p style="font-size:13px;color:#ffffff;margin:0;"><strong>Timeline:</strong> Typically within 3 months of request</p>
    </div>
    <div style="background:#122038;border-radius:8px;padding:16px;margin:0 0 20px;">
      <p style="font-size:13px;color:#ffffff;margin:0;"><strong>Process:</strong> Contact your local authority Environmental Health department</p>
    </div>

    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 8px;">
      <strong style="color:#EF4444;">Important:</strong> Don't request a reinspection until you're confident
      all improvements are complete. A failed reinspection wastes your fee and can hurt your credibility.
    </p>

    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin:0 0 20px;">
      A HygieneFix action plan shows you exactly what to fix first, so you know when you're ready
      to request that reinspection.
    </p>

    <a href="${v.baseUrl}/check/${v.fhrsid}" style="display:inline-block;background:#38BDF8;color:#0B1B2B;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
      Get Reinspection Ready →
    </a>

    <p style="font-size:11px;color:#475569;margin:24px 0 0;line-height:1.5;">
      <a href="${v.baseUrl}/unsubscribe?fhrsid=${v.fhrsid}" style="color:#475569;">Unsubscribe</a> |
      Read our full <a href="${v.baseUrl}/blog/how-to-request-food-hygiene-reinspection" style="color:#475569;">reinspection guide</a>
    </p>
  </div>
</div>
</body></html>`,
  },
};

export function renderTemplate(templateKey: string, vars: EmailVars): { subject: string; html: string } | null {
  const template = EMAIL_TEMPLATES[templateKey];
  if (!template) return null;

  const subject = template.subject
    .replace('{{businessName}}', vars.businessName)
    .replace('{{rating}}', String(vars.rating));

  return {
    subject,
    html: template.body(vars),
  };
}
