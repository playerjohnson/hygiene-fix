import { NextResponse } from 'next/server';
import { generateActionPlanPDF } from '@/lib/pdf-generator';
import type { FSAEstablishment } from '@/lib/types';
import type { GeneratedChecklist } from '@/lib/checklist-generator';

// Fictional establishment for sample preview
const SAMPLE_ESTABLISHMENT: FSAEstablishment = {
  FHRSID: 0,
  BusinessName: 'The Golden Dragon',
  BusinessType: 'Restaurant/Cafe/Canteen',
  BusinessTypeID: 1,
  RatingValue: '1',
  RatingDate: '2025-12-10',
  RatingKey: 'fhrs_1_en-gb',
  NewRatingPending: false,
  AddressLine1: '42 High Street',
  AddressLine2: 'Anytown',
  AddressLine3: 'Greater Manchester',
  AddressLine4: '',
  PostCode: 'M1 4AA',
  LocalAuthorityName: 'Manchester City Council',
  LocalAuthorityCode: '440',
  LocalAuthorityEmailAddress: 'foodsafety@manchester.gov.uk',
  LocalAuthorityWebSite: 'https://www.manchester.gov.uk',
  SchemeType: 'FHRS',
  geocode: { longitude: '-2.2426', latitude: '53.4808' },
  scores: {
    Hygiene: 15,
    Structural: 10,
    ConfidenceInManagement: 20,
  },
  RightToReply: '',
};

const SAMPLE_CHECKLIST: GeneratedChecklist = {
  summary:
    'The Golden Dragon received a rating of 1 (Major Improvement Necessary) with significant concerns in food handling hygiene and management documentation. The highest priority is addressing cross-contamination risks and implementing a complete SFBB system. With focused effort on the critical items below, reaching a 3 or above within 8–12 weeks is realistic.',
  sections: [
    {
      title: 'Food Handling & Hygiene',
      priority: 'critical',
      items: [
        {
          task: 'Implement temperature monitoring system',
          detail:
            'Record fridge temperatures twice daily (target: 1–5°C). Use a calibrated probe thermometer for all deliveries and hot-held food. Keep a bound logbook — loose sheets are not accepted by inspectors.',
          timeframe: 'Immediately',
          sfbbReference: 'Safe Method: Chilling',
        },
        {
          task: 'Eliminate cross-contamination risks',
          detail:
            'Separate raw and cooked food storage with dedicated colour-coded chopping boards (red = raw meat, blue = raw fish, green = salad/vegetables). Store raw meat on lowest fridge shelf. Use separate utensils for raw and ready-to-eat food.',
          timeframe: 'Within 3 days',
          sfbbReference: 'Safe Method: Cross-contamination',
        },
        {
          task: 'Implement allergen management procedures',
          detail:
            'Under Natasha\'s Law, all prepacked for direct sale (PPDS) food must display full ingredient lists with allergens emphasised. Create an allergen matrix for your menu. Train all staff to handle allergen queries and document training records.',
          timeframe: 'Within 1 week',
          sfbbReference: 'Safe Method: Allergen management',
        },
        {
          task: 'Ensure correct cooking temperatures',
          detail:
            'All food must reach 75°C core temperature for at least 2 minutes. Check with a probe thermometer and record in your cooking log. Pay special attention to rice, chicken, and reheated dishes.',
          timeframe: 'Immediately',
          sfbbReference: 'Safe Method: Cooking',
        },
      ],
    },
    {
      title: 'Management & Documentation',
      priority: 'critical',
      items: [
        {
          task: 'Set up Safer Food Better Business (SFBB)',
          detail:
            'Download the SFBB pack from food.gov.uk for restaurants. Complete all safe methods, including opening and closing checks, 4-weekly review, and management sections. This is the single document inspectors check first.',
          timeframe: 'Within 1 week',
          sfbbReference: 'All sections',
        },
        {
          task: 'Create a HACCP-based food safety plan',
          detail:
            'Document your food flow from delivery to service. Identify hazards at each stage (biological, chemical, physical, allergen). Record critical control points and corrective actions. The SFBB pack covers this for small businesses.',
          timeframe: 'Within 2 weeks',
          sfbbReference: 'Management section',
        },
        {
          task: 'Book Level 2 Food Hygiene training',
          detail:
            'All food handlers should hold a Level 2 Food Hygiene certificate. The person in charge should have Level 3. Online courses cost £20–30 and can be completed in a day. Keep certificates filed for inspection.',
          timeframe: 'Within 2 weeks',
        },
      ],
    },
    {
      title: 'Premises & Structural',
      priority: 'high',
      items: [
        {
          task: 'Deep clean the kitchen and all food preparation areas',
          detail:
            'Clean behind equipment, inside extractors, and under fixtures. Use food-safe degreaser. Pay special attention to grease traps, extraction canopies, and wall-floor junctions. Document with photos and a cleaning schedule.',
          timeframe: 'Within 1 week',
          sfbbReference: 'Safe Method: Cleaning',
        },
        {
          task: 'Repair any structural defamation to walls, floors, and ceilings',
          detail:
            'Fill cracks, repair peeling paint, replace broken tiles. All surfaces in food areas must be smooth, impervious, and easy to clean. Inspectors note any gaps where pests could enter.',
          timeframe: 'Within 1 month',
          sfbbReference: 'Safe Method: Premises maintenance',
        },
        {
          task: 'Establish pest control procedures',
          detail:
            'Contract a pest control company for quarterly inspections. Seal gaps around pipes and doors with food-safe sealant. Install fly screens on open windows. Keep a pest control logbook with inspection reports.',
          timeframe: 'Within 2 weeks',
        },
      ],
    },
    {
      title: 'Staff Training & Supervision',
      priority: 'medium',
      items: [
        {
          task: 'Implement staff handwashing procedures',
          detail:
            'Ensure handwash basins are stocked with antibacterial soap, paper towels, and signage. Staff must wash hands: on entering the kitchen, after handling raw food, after using the toilet, and after breaks.',
          timeframe: 'Immediately',
          sfbbReference: 'Safe Method: Personal hygiene',
        },
        {
          task: 'Create a cleaning schedule and assign responsibilities',
          detail:
            'List all areas, equipment, and frequencies (daily, weekly, monthly). Assign named staff to each task. Use a sign-off sheet to record completion. Inspectors look for an active, maintained schedule — not a blank template.',
          timeframe: 'Within 1 week',
          sfbbReference: 'Safe Method: Cleaning schedule',
        },
      ],
    },
  ],
  reinspectionAdvice:
    'Once you have completed all critical and high-priority items, contact Manchester City Council Environmental Health to request a paid re-inspection (typically £160–300). They aim to visit within 3 months. Ensure all documentation is complete, displayed, and accessible. On the day, have your SFBB pack, temperature logs, cleaning schedules, and training records ready for the inspector. First impressions matter — a visibly clean premises with organised paperwork signals competence.',
  estimatedTimeline:
    '8–12 weeks to achieve a rating of 3 or above, assuming consistent daily effort on documentation and immediate action on critical items. Most businesses see the biggest score improvements from management documentation.',
};

export async function GET() {
  try {
    const pdfBuffer = await generateActionPlanPDF(SAMPLE_ESTABLISHMENT, SAMPLE_CHECKLIST);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="HygieneFix-Sample-Action-Plan.pdf"',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Sample PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate sample PDF' }, { status: 500 });
  }
}
