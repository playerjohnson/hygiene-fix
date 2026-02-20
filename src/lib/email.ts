/**
 * HygieneFix Email Delivery
 *
 * Uses Resend to send the action plan PDF to customers after purchase.
 */

import { Resend } from 'resend';
import { GeneratedChecklist } from './checklist-generator';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

function getFromEmail() {
  return process.env.FROM_EMAIL || 'HygieneFix <noreply@hygienefix.co.uk>';
}

interface SendActionPlanParams {
  to: string;
  businessName: string;
  ratingValue: string;
  pdfBuffer: Buffer;
  checklist: GeneratedChecklist;
}

export async function sendActionPlanEmail({
  to,
  businessName,
  ratingValue,
  pdfBuffer,
  checklist,
}: SendActionPlanParams) {
  const ratingNum = parseInt(ratingValue) || 0;
  const sectionCount = checklist.sections.reduce((acc, s) => acc + s.items.length, 0);

  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to,
    subject: `Your HygieneFix Action Plan — ${businessName}`,
    html: buildEmailHTML(businessName, ratingNum, checklist, sectionCount),
    attachments: [
      {
        filename: `HygieneFix-Action-Plan-${sanitiseFilename(businessName)}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

function buildEmailHTML(
  businessName: string,
  rating: number,
  checklist: GeneratedChecklist,
  totalItems: number
): string {
  const criticalCount = checklist.sections
    .filter((s) => s.priority === 'critical')
    .reduce((acc, s) => acc + s.items.length, 0);
  const highCount = checklist.sections
    .filter((s) => s.priority === 'high')
    .reduce((acc, s) => acc + s.items.length, 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:Arial, Helvetica, sans-serif;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff;">
    
    <!-- Header -->
    <div style="background:#0B1B2B; padding:32px 24px;">
      <h1 style="color:#ffffff; margin:0 0 4px; font-size:22px;">HygieneFix</h1>
      <p style="color:#38BDF8; margin:0; font-size:13px;">Your Personalised Action Plan is Ready</p>
    </div>
    
    <!-- Blue accent -->
    <div style="height:3px; background:#2563EB;"></div>
    
    <!-- Content -->
    <div style="padding:32px 24px;">
      <p style="color:#334155; font-size:15px; line-height:1.6; margin:0 0 20px;">
        Hi there,
      </p>
      <p style="color:#334155; font-size:15px; line-height:1.6; margin:0 0 20px;">
        Your personalised action plan for <strong>${escapeHtml(businessName)}</strong> is attached to this email as a PDF.
      </p>
      
      <!-- Summary box -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; margin:0 0 24px;">
        <p style="color:#0B1B2B; font-weight:bold; margin:0 0 12px; font-size:14px;">Your Plan at a Glance</p>
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0; color:#64748b; font-size:13px;">Current Rating</td>
            <td style="padding:6px 0; color:#0B1B2B; font-weight:bold; font-size:13px; text-align:right;">${rating}/5</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#64748b; font-size:13px;">Total Action Items</td>
            <td style="padding:6px 0; color:#0B1B2B; font-weight:bold; font-size:13px; text-align:right;">${totalItems}</td>
          </tr>
          ${criticalCount > 0 ? `
          <tr>
            <td style="padding:6px 0; color:#64748b; font-size:13px;">Critical Priority</td>
            <td style="padding:6px 0; color:#DC2626; font-weight:bold; font-size:13px; text-align:right;">${criticalCount} items</td>
          </tr>` : ''}
          ${highCount > 0 ? `
          <tr>
            <td style="padding:6px 0; color:#64748b; font-size:13px;">High Priority</td>
            <td style="padding:6px 0; color:#EA580C; font-weight:bold; font-size:13px; text-align:right;">${highCount} items</td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 0; color:#64748b; font-size:13px;">Estimated Timeline</td>
            <td style="padding:6px 0; color:#16A34A; font-weight:bold; font-size:13px; text-align:right;">${escapeHtml(checklist.estimatedTimeline)}</td>
          </tr>
        </table>
      </div>
      
      <!-- Quick start -->
      <p style="color:#334155; font-size:15px; line-height:1.6; margin:0 0 12px;">
        <strong>Where to start:</strong>
      </p>
      <p style="color:#334155; font-size:14px; line-height:1.6; margin:0 0 20px;">
        ${escapeHtml(checklist.summary)}
      </p>
      
      <!-- CTA -->
      <div style="text-align:center; margin:28px 0;">
        <p style="color:#64748b; font-size:13px; margin:0 0 8px;">Your PDF action plan is attached to this email ↓</p>
      </div>
      
      <!-- Tips -->
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px; margin:0 0 24px;">
        <p style="color:#166534; font-weight:bold; margin:0 0 8px; font-size:13px;">💡 Tips for Success</p>
        <ul style="color:#334155; font-size:13px; line-height:1.8; margin:0; padding-left:20px;">
          <li>Print the checklist and tick items off as you complete them</li>
          <li>Start with critical items — these are what inspectors notice first</li>
          <li>Keep dated photos of improvements as evidence</li>
          <li>Once ready, contact your local authority to request a re-inspection</li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 24px;">
      <p style="color:#94a3b8; font-size:11px; line-height:1.6; margin:0; text-align:center;">
        This action plan is for guidance only and does not constitute professional food safety advice.
        Always follow the specific instructions from your local authority food safety officer.
        <br><br>
        HygieneFix — Helping food businesses improve their hygiene ratings.
        <br>
        <a href="https://hygienefix.co.uk" style="color:#2563EB; text-decoration:none;">hygienefix.co.uk</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitiseFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 40);
}
