/**
 * HygieneFix Checklist Generator
 *
 * Uses Claude API to generate a personalized food hygiene improvement
 * checklist based on the establishment's scores and business type.
 */

import Anthropic from '@anthropic-ai/sdk';
import { FSAEstablishment } from './types';
import { interpretRating } from './scores';

function getAnthropicClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });
}

export interface ChecklistSection {
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  items: ChecklistItem[];
}

export interface ChecklistItem {
  task: string;
  detail: string;
  timeframe: string;
  sfbbReference?: string;
}

export interface GeneratedChecklist {
  summary: string;
  sections: ChecklistSection[];
  reinspectionAdvice: string;
  estimatedTimeline: string;
}

export async function generateChecklist(
  establishment: FSAEstablishment
): Promise<GeneratedChecklist> {
  const breakdown = interpretRating(establishment);
  const ratingNum = parseInt(establishment.RatingValue) || 0;

  const prompt = buildPrompt(establishment, breakdown, ratingNum);

  const response = await getAnthropicClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  return parseChecklistResponse(text);
}

function buildPrompt(
  est: FSAEstablishment,
  breakdown: ReturnType<typeof interpretRating>,
  ratingNum: number
): string {
  const hygieneScore = est.scores.Hygiene;
  const structuralScore = est.scores.Structural;
  const managementScore = est.scores.ConfidenceInManagement;

  return `You are an expert UK food hygiene consultant. Generate a personalised improvement action plan for this food business.

BUSINESS DETAILS:
- Name: ${est.BusinessName}
- Type: ${est.BusinessType}
- Current Rating: ${ratingNum}/5 (${breakdown.overall.label})
- Postcode area: ${est.PostCode}
- Last inspected: ${est.RatingDate}

SCORES (lower is better — 0 is best):
- Hygiene (food handling): ${hygieneScore !== null ? `${hygieneScore}/25` : 'N/A'}
- Structural (premises): ${structuralScore !== null ? `${structuralScore}/25` : 'N/A'}
- Confidence in Management: ${managementScore !== null ? `${managementScore}/30` : 'N/A'}

SCORE INTERPRETATIONS:
${breakdown.scores.map((s) => `- ${s.area}: ${s.label} — ${s.shortAdvice}`).join('\n')}

WORST AREA: ${breakdown.worstArea}

Generate a detailed, actionable improvement checklist. Respond in JSON format only (no markdown fences) with this exact structure:

{
  "summary": "2-3 sentence overview of their situation and what needs to happen",
  "sections": [
    {
      "title": "Section name (e.g. 'Food Handling & Hygiene')",
      "priority": "critical|high|medium|low",
      "items": [
        {
          "task": "Clear action item",
          "detail": "Specific guidance on how to complete this, tailored to their business type (${est.BusinessType})",
          "timeframe": "e.g. 'Immediately', 'Within 1 week', 'Within 1 month'",
          "sfbbReference": "Relevant SFBB section if applicable, e.g. 'Cross-contamination', 'Cooking', 'Cleaning'"
        }
      ]
    }
  ],
  "reinspectionAdvice": "Advice on when and how to request a re-inspection, including what inspectors look for",
  "estimatedTimeline": "Realistic estimate of how long full compliance will take"
}

REQUIREMENTS:
- Tailor advice to their specific business type (${est.BusinessType})
- Focus most items on their worst-scoring areas
- Include specific SFBB (Safer Food, Better Business) references where relevant
- For management scores of 20+, include detailed SFBB implementation steps
- For hygiene scores of 15+, include specific temperature control and cross-contamination steps
- For structural scores of 15+, include specific cleaning, maintenance, and pest control steps
- ALWAYS include an allergen management section covering: Natasha's Law (PPDS allergen labelling since October 2021), allergen information display, staff allergen training records, and cross-contamination procedures for allergens. This is a legal requirement for all food businesses.
- Ensure management documentation items (HACCP records, temperature logs, cleaning schedules, staff training records) are given strong weighting — these are typically the easiest quick wins for a low-scored business
- Include reinspection process details: businesses must formally request a revisit from their local authority, fees typically range £150–300, and inspectors usually visit within 3 months of request
- Include at least 3-5 items per section that scored poorly
- Use plain English, avoid jargon, be specific and actionable
- Include food handler training requirements (Level 2 Food Hygiene if management score is poor)
- Minimum 4 sections, ordered by priority (critical first)`;
}

function parseChecklistResponse(text: string): GeneratedChecklist {
  try {
    // Strip any accidental markdown fences
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    // Validate structure
    return {
      summary: parsed.summary || 'Action plan generated based on your inspection scores.',
      sections: (parsed.sections || []).map(
        (s: Record<string, unknown>) => ({
          title: s.title || 'General Improvements',
          priority: ['critical', 'high', 'medium', 'low'].includes(
            s.priority as string
          )
            ? s.priority
            : 'medium',
          items: (
            (s.items as Record<string, unknown>[]) || []
          ).map((i: Record<string, unknown>) => ({
            task: i.task || '',
            detail: i.detail || '',
            timeframe: i.timeframe || 'As soon as possible',
            sfbbReference: i.sfbbReference || undefined,
          })),
        })
      ),
      reinspectionAdvice:
        parsed.reinspectionAdvice ||
        'Contact your local authority to request a paid re-inspection once improvements are made.',
      estimatedTimeline:
        parsed.estimatedTimeline || '4-8 weeks with consistent effort.',
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      summary:
        'We generated improvement advice based on your scores. Please review the recommendations below.',
      sections: [
        {
          title: 'General Improvements',
          priority: 'high',
          items: [
            {
              task: 'Review your full inspection report',
              detail:
                'Contact your local authority for the detailed inspection report with specific officer comments.',
              timeframe: 'Immediately',
            },
            {
              task: 'Implement SFBB (Safer Food, Better Business)',
              detail:
                'Download the SFBB pack from food.gov.uk and complete all sections relevant to your business.',
              timeframe: 'Within 1 week',
              sfbbReference: 'All sections',
            },
            {
              task: 'Book food hygiene training',
              detail:
                'All food handlers should complete Level 2 Food Hygiene certification.',
              timeframe: 'Within 2 weeks',
            },
          ],
        },
      ],
      reinspectionAdvice:
        'Once improvements are made, contact your local authority to request a paid re-inspection (typically £150-200).',
      estimatedTimeline: '4-8 weeks with consistent effort.',
    };
  }
}
