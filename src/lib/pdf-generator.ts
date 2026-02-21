/**
 * HygieneFix PDF Generator
 *
 * Creates a branded, professional action plan PDF using jsPDF.
 * Designed to be clear, printable, and actionable for food business owners.
 */

import { jsPDF } from 'jspdf';
import { FSAEstablishment } from './types';
import { interpretRating, formatRatingDate } from './scores';
import { GeneratedChecklist, ChecklistSection } from './checklist-generator';

// Brand colours
const COLORS = {
  navy: [11, 27, 43] as [number, number, number],
  dark: [18, 35, 56] as [number, number, number],
  blue: [37, 99, 235] as [number, number, number],
  sky: [56, 189, 248] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  gray: [148, 163, 184] as [number, number, number],
  darkGray: [51, 65, 85] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  orange: [234, 88, 12] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
};

/** Mix a colour with white at a given ratio (0=white, 1=full colour) */
function tint(color: [number, number, number], amount: number): [number, number, number] {
  return [
    Math.round(255 - (255 - color[0]) * amount),
    Math.round(255 - (255 - color[1]) * amount),
    Math.round(255 - (255 - color[2]) * amount),
  ];
}

const PRIORITY_COLORS: Record<string, [number, number, number]> = {
  critical: COLORS.red,
  high: COLORS.orange,
  medium: COLORS.amber,
  low: COLORS.green,
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export async function generateActionPlanPDF(
  establishment: FSAEstablishment,
  checklist: GeneratedChecklist
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const breakdown = interpretRating(establishment);
  const ratingNum = parseInt(establishment.RatingValue) || 0;

  let y = 0;

  // ========== COVER / HEADER ==========
  y = drawHeader(doc, establishment, ratingNum);

  // ========== SUMMARY ==========
  y = drawSummary(doc, y, checklist.summary, breakdown);

  // ========== SCORE BREAKDOWN ==========
  y = drawScoreBreakdown(doc, y, breakdown);

  // ========== CHECKLIST SECTIONS ==========
  for (const section of checklist.sections) {
    y = drawSection(doc, y, section);
  }

  // ========== RE-INSPECTION ADVICE ==========
  y = drawReinspectionAdvice(doc, y, checklist);

  // ========== FOOTER ON ALL PAGES ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages, establishment);
  }

  return Buffer.from(doc.output('arraybuffer'));
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_HEIGHT - 30) {
    doc.addPage();
    return 20;
  }
  return y;
}

function drawHeader(doc: jsPDF, est: FSAEstablishment, rating: number): number {
  // Navy header band
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, PAGE_WIDTH, 55, 'F');

  // Blue accent line
  doc.setFillColor(...COLORS.blue);
  doc.rect(0, 55, PAGE_WIDTH, 2, 'F');

  // HygieneFix logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.white);
  doc.text('HygieneFix', MARGIN, 18);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.sky);
  doc.text('Personalised Food Hygiene Action Plan', MARGIN, 26);

  // Business name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  const businessName = est.BusinessName.length > 50
    ? est.BusinessName.substring(0, 47) + '...'
    : est.BusinessName;
  doc.text(businessName, MARGIN, 38);

  // Address + date
  const address = [est.AddressLine1, est.PostCode].filter(Boolean).join(', ');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text(address, MARGIN, 46);
  doc.text(`Last inspected: ${formatRatingDate(est.RatingDate)}`, MARGIN, 51);

  // Rating badge (right side)
  const badgeX = PAGE_WIDTH - MARGIN - 20;
  const ratingColor = getRatingPDFColor(rating);
  doc.setFillColor(...ratingColor);
  doc.roundedRect(badgeX, 12, 20, 28, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.white);
  doc.text(String(rating), badgeX + 10, 28, { align: 'center' });

  doc.setFontSize(7);
  doc.text('out of 5', badgeX + 10, 35, { align: 'center' });

  return 68;
}

function drawSummary(
  doc: jsPDF,
  y: number,
  summary: string,
  breakdown: ReturnType<typeof interpretRating>
): number {
  y = checkPageBreak(doc, y, 45);

  // Section header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.navy);
  doc.text('Overview', MARGIN, y);
  y += 3;

  // Blue underline
  doc.setFillColor(...COLORS.blue);
  doc.rect(MARGIN, y, 30, 1, 'F');
  y += 8;

  // Summary text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.darkGray);
  const summaryLines = doc.splitTextToSize(summary, CONTENT_WIDTH);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 5 + 4;

  // Overall verdict box
  const ratingColor = getRatingPDFColor(breakdown.overall.rating);
  const ratingTint = tint(ratingColor, 0.08);
  doc.setFillColor(...ratingTint);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 14, 2, 2, 'F');

  doc.setDrawColor(...ratingColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...ratingColor);
  doc.text(`Current Rating: ${breakdown.overall.rating}/5 — ${breakdown.overall.label}`, MARGIN + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.darkGray);
  const descLines = doc.splitTextToSize(breakdown.overall.description, CONTENT_WIDTH - 12);
  doc.text(descLines[0] || '', MARGIN + 5, y + 11);

  y += 20;
  return y;
}

function drawScoreBreakdown(
  doc: jsPDF,
  y: number,
  breakdown: ReturnType<typeof interpretRating>
): number {
  if (breakdown.scores.length === 0) return y;

  y = checkPageBreak(doc, y, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.navy);
  doc.text('Score Breakdown', MARGIN, y);
  y += 3;
  doc.setFillColor(...COLORS.blue);
  doc.rect(MARGIN, y, 30, 1, 'F');
  y += 8;

  for (const score of breakdown.scores) {
    y = checkPageBreak(doc, y, 22);

    const severityColor = getSeverityPDFColor(score.severity);

    // Score bar background
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 16, 2, 2, 'F');

    // Score bar fill
    const fillWidth = Math.max(2, ((score.maxScore - score.score) / score.maxScore) * (CONTENT_WIDTH - 50));
    const barTint = tint(severityColor, 0.15);
    doc.setFillColor(...barTint);
    doc.roundedRect(MARGIN, y, fillWidth, 16, 2, 2, 'F');

    // Area name
    const areaLabels: Record<string, string> = {
      Hygiene: 'Food Handling & Hygiene',
      Structural: 'Premises Condition',
      ConfidenceInManagement: 'Management & Documentation',
    };
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.navy);
    doc.text(areaLabels[score.area] || score.area, MARGIN + 4, y + 6);

    // Score value (right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...severityColor);
    doc.text(`${score.score}/${score.maxScore} — ${score.label}`, PAGE_WIDTH - MARGIN - 4, y + 6, {
      align: 'right',
    });

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.gray);
    doc.text(score.shortAdvice, MARGIN + 4, y + 12);

    y += 20;
  }

  return y;
}

function drawSection(doc: jsPDF, y: number, section: ChecklistSection): number {
  y = checkPageBreak(doc, y, 40);

  const priorityColor = PRIORITY_COLORS[section.priority] || COLORS.blue;

  // Section header with priority badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);
  doc.text(section.title, MARGIN, y);

  // Priority badge
  const priorityLabel = section.priority.toUpperCase();
  const badgeWidth = doc.getTextWidth(priorityLabel) + 6;
  const badgeX = PAGE_WIDTH - MARGIN - badgeWidth;

  doc.setFillColor(...priorityColor);
  doc.roundedRect(badgeX, y - 4.5, badgeWidth, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.white);
  doc.text(priorityLabel, badgeX + badgeWidth / 2, y, { align: 'center' });

  y += 3;
  doc.setFillColor(...priorityColor);
  doc.rect(MARGIN, y, 25, 0.8, 'F');
  y += 6;

  // Checklist items
  for (let i = 0; i < section.items.length; i++) {
    const item = section.items[i];
    const itemHeight = estimateItemHeight(doc, item);
    y = checkPageBreak(doc, y, itemHeight + 4);

    // Checkbox
    doc.setDrawColor(...COLORS.gray);
    doc.setLineWidth(0.3);
    doc.rect(MARGIN, y - 3, 4, 4);

    // Item number and task
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.navy);
    doc.text(`${item.task}`, MARGIN + 7, y);
    y += 5;

    // Detail
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.darkGray);
    const detailLines = doc.splitTextToSize(item.detail, CONTENT_WIDTH - 12);
    doc.text(detailLines, MARGIN + 7, y);
    y += detailLines.length * 4;

    // Timeframe + SFBB reference
    const metaItems: string[] = [];
    if (item.timeframe) metaItems.push(`Complete: ${item.timeframe}`);
    if (item.sfbbReference) metaItems.push(`SFBB: ${item.sfbbReference}`);

    if (metaItems.length > 0) {
      y += 1;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.blue);
      doc.text(metaItems.join('   |   '), MARGIN + 7, y);
      y += 4;
    }

    y += 3;

    // Subtle separator between items
    if (i < section.items.length - 1) {
      doc.setDrawColor(...COLORS.lightGray);
      doc.setLineWidth(0.2);
      doc.line(MARGIN + 7, y - 1, PAGE_WIDTH - MARGIN, y - 1);
    }
  }

  y += 4;
  return y;
}

function drawReinspectionAdvice(
  doc: jsPDF,
  y: number,
  checklist: GeneratedChecklist
): number {
  y = checkPageBreak(doc, y, 55);

  // Section header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.navy);
  doc.text('Re-Inspection & Timeline', MARGIN, y);
  y += 3;
  doc.setFillColor(...COLORS.green);
  doc.rect(MARGIN, y, 30, 1, 'F');
  y += 8;

  // Estimated timeline box
  const timelineText = `Estimated Timeline: ${checklist.estimatedTimeline}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const timelineLines = doc.splitTextToSize(timelineText, CONTENT_WIDTH - 10);
  const timelineBoxHeight = Math.max(12, timelineLines.length * 4.5 + 5);

  const greenTint = tint(COLORS.green, 0.08);
  doc.setFillColor(...greenTint);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, timelineBoxHeight, 2, 2, 'F');
  doc.setDrawColor(...COLORS.green);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, timelineBoxHeight, 2, 2, 'S');

  doc.setTextColor(...COLORS.green);
  doc.text(timelineLines, MARGIN + 5, y + 7);
  y += timelineBoxHeight + 6;

  // Re-inspection advice
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.darkGray);
  const adviceLines = doc.splitTextToSize(checklist.reinspectionAdvice, CONTENT_WIDTH);
  doc.text(adviceLines, MARGIN, y);
  y += adviceLines.length * 4.5 + 6;

  // Key tips box
  y = checkPageBreak(doc, y, 40);

  doc.setFillColor(...COLORS.lightGray);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 30, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.navy);
  doc.text('Before requesting a re-inspection:', MARGIN + 5, y + 7);

  const tips = [
    'Complete all critical and high-priority items on this checklist',
    'Ensure your SFBB/HACCP documentation is fully up to date',
    'Have proof of staff training (Level 2 certificates)',
    'Contact your local authority - re-inspections typically cost £150-200',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.darkGray);
  tips.forEach((tip, i) => {
    doc.text(`-  ${tip}`, MARGIN + 5, y + 13 + i * 4.5);
  });

  y += 38;
  return y;
}

function drawFooter(doc: jsPDF, page: number, totalPages: number, est: FSAEstablishment): void {
  const y = PAGE_HEIGHT - 12;

  // Separator
  doc.setDrawColor(...COLORS.lightGray);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y - 3, PAGE_WIDTH - MARGIN, y - 3);

  // Left: branding
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.gray);
  doc.text(`HygieneFix Action Plan — ${est.BusinessName}`, MARGIN, y);

  // Center: disclaimer
  doc.text('For guidance only. Not a substitute for professional food safety advice.', PAGE_WIDTH / 2, y, {
    align: 'center',
  });

  // Right: page number
  doc.text(`Page ${page} of ${totalPages}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });

  // Date generated
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, MARGIN, y + 4);
}

function estimateItemHeight(doc: jsPDF, item: { task: string; detail: string; timeframe?: string; sfbbReference?: string }): number {
  const detailLines = doc.splitTextToSize(item.detail, CONTENT_WIDTH - 12);
  let height = 5 + detailLines.length * 4 + 3;
  if (item.timeframe || item.sfbbReference) height += 5;
  return height;
}

function getRatingPDFColor(rating: number): [number, number, number] {
  const map: Record<number, [number, number, number]> = {
    0: COLORS.red,
    1: COLORS.orange,
    2: COLORS.amber,
    3: [132, 204, 22],
    4: COLORS.green,
    5: [5, 150, 105],
  };
  return map[rating] || COLORS.gray;
}

function getSeverityPDFColor(severity: string): [number, number, number] {
  const map: Record<string, [number, number, number]> = {
    urgent: COLORS.red,
    major: COLORS.orange,
    improvement: COLORS.amber,
    satisfactory: [132, 204, 22],
    good: COLORS.green,
  };
  return map[severity] || COLORS.gray;
}
