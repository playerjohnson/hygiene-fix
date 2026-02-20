import { FSAEstablishment, ScoreInterpretation, RatingBreakdown } from './types';

const RATING_LABELS: Record<string, { label: string; description: string }> = {
  '0': { label: 'Urgent Improvement Necessary', description: 'The food hygiene standards at this business are critically below requirements. Immediate action is essential.' },
  '1': { label: 'Major Improvement Necessary', description: 'Significant improvements are required to meet food hygiene standards. The business must address serious issues promptly.' },
  '2': { label: 'Improvement Necessary', description: 'Some improvements are needed to bring food hygiene standards up to the required level.' },
  '3': { label: 'Generally Satisfactory', description: 'Food hygiene standards are broadly acceptable but there is room for improvement.' },
  '4': { label: 'Good', description: 'Food hygiene standards are good with only minor improvements needed.' },
  '5': { label: 'Very Good', description: 'Excellent food hygiene standards. The business is fully compliant.' },
};

function interpretHygieneScore(score: number): ScoreInterpretation {
  const severityMap: [number, ScoreInterpretation['severity'], string, string][] = [
    [0, 'good', 'Very Good', 'Food handling procedures are excellent. Keep up current practices.'],
    [5, 'satisfactory', 'Good', 'Minor issues with food handling. Review temperature monitoring and storage practices.'],
    [10, 'improvement', 'Generally Satisfactory', 'Improvements needed in food handling. Focus on cross-contamination controls, cooking temperatures, and date labelling.'],
    [15, 'major', 'Improvement Necessary', 'Significant issues with food handling. Urgently review separation of raw/ready-to-eat foods, temperature controls, and personal hygiene practices.'],
    [20, 'urgent', 'Major Improvement Necessary', 'Serious food handling failures. Immediate action required on temperature control, cross-contamination prevention, and food storage.'],
    [25, 'urgent', 'Urgent Improvement Necessary', 'Critical food safety hazards in handling. Risk of causing foodborne illness. Emergency corrective action needed.'],
  ];

  const match = severityMap.find(([s]) => s === score) || severityMap[severityMap.length - 1];
  return {
    area: 'Hygiene',
    score,
    maxScore: 25,
    label: match[2],
    severity: match[1],
    description: 'How hygienically food is handled — preparation, cooking, reheating, cooling and storage.',
    shortAdvice: match[3],
  };
}

function interpretStructuralScore(score: number): ScoreInterpretation {
  const severityMap: [number, ScoreInterpretation['severity'], string, string][] = [
    [0, 'good', 'Very Good', 'Premises condition is excellent. Maintain current cleaning and maintenance schedules.'],
    [5, 'satisfactory', 'Good', 'Minor structural issues. Review cleaning schedule and check equipment condition.'],
    [10, 'improvement', 'Generally Satisfactory', 'Improvements needed to premises. Focus on cleaning schedules, pest control, and equipment maintenance.'],
    [15, 'major', 'Improvement Necessary', 'Significant premises issues. Address cleaning deficiencies, pest control gaps, and facility condition urgently.'],
    [20, 'urgent', 'Major Improvement Necessary', 'Serious structural deficiencies. Major repairs, deep cleaning, and pest control action needed immediately.'],
    [25, 'urgent', 'Urgent Improvement Necessary', 'Critical premises condition. May require closure for remedial work. Emergency cleaning and repairs essential.'],
  ];

  const match = severityMap.find(([s]) => s === score) || severityMap[severityMap.length - 1];
  return {
    area: 'Structural',
    score,
    maxScore: 25,
    label: match[2],
    severity: match[1],
    description: 'The condition of the building — cleanliness, layout, lighting, ventilation, pest control and facilities.',
    shortAdvice: match[3],
  };
}

function interpretManagementScore(score: number): ScoreInterpretation {
  const severityMap: [number, ScoreInterpretation['severity'], string, string][] = [
    [0, 'good', 'Very Good', 'Excellent management systems in place. Documentation and training are exemplary.'],
    [5, 'satisfactory', 'Good', 'Good management. Minor improvements to documentation or training records may help.'],
    [10, 'improvement', 'Generally Satisfactory', 'Management systems need strengthening. Ensure SFBB/HACCP pack is complete and staff training is documented.'],
    [20, 'major', 'Improvement Necessary', 'Significant gaps in food safety management. Implement a proper SFBB system, train all staff, and keep written records.'],
    [30, 'urgent', 'Urgent Improvement Necessary', 'No effective food safety management system. Urgently implement SFBB, train all staff to Level 2, and establish documented procedures.'],
  ];

  const match = severityMap.find(([s]) => s === score) || severityMap[severityMap.length - 1];
  return {
    area: 'ConfidenceInManagement',
    score,
    maxScore: 30,
    label: match[2],
    severity: match[1],
    description: 'How the business manages food safety — processes, staff training, documentation and record keeping.',
    shortAdvice: match[3],
  };
}

export function interpretRating(establishment: FSAEstablishment): RatingBreakdown {
  const ratingNum = parseInt(establishment.RatingValue) || 0;
  const ratingInfo = RATING_LABELS[establishment.RatingValue] || RATING_LABELS['0'];

  const scores: ScoreInterpretation[] = [];
  const { Hygiene, Structural, ConfidenceInManagement } = establishment.scores;

  if (Hygiene !== null) scores.push(interpretHygieneScore(Hygiene));
  if (Structural !== null) scores.push(interpretStructuralScore(Structural));
  if (ConfidenceInManagement !== null) scores.push(interpretManagementScore(ConfidenceInManagement));

  // Sort by severity (worst first)
  const severityOrder: Record<string, number> = { urgent: 0, major: 1, improvement: 2, satisfactory: 3, good: 4 };
  scores.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  const worstScore = scores[0];
  const areaNames: Record<string, string> = {
    Hygiene: 'food handling and hygiene',
    Structural: 'premises condition and cleanliness',
    ConfidenceInManagement: 'management systems and documentation',
  };

  const primaryActions: Record<string, string> = {
    Hygiene: 'Review and improve your food handling procedures — temperature monitoring, cross-contamination controls, and storage practices.',
    Structural: 'Address premises condition — deep clean, fix maintenance issues, review pest control, and ensure adequate facilities.',
    ConfidenceInManagement: 'Implement a food safety management system (SFBB), train all food handlers to Level 2, and start keeping written records.',
  };

  return {
    overall: {
      rating: ratingNum,
      label: ratingInfo.label,
      description: ratingInfo.description,
    },
    scores,
    worstArea: worstScore ? areaNames[worstScore.area] || 'overall compliance' : 'overall compliance',
    primaryAction: worstScore ? primaryActions[worstScore.area] || '' : '',
  };
}

export function getRatingColor(rating: number | string): string {
  const r = typeof rating === 'string' ? parseInt(rating) : rating;
  const colors: Record<number, string> = {
    0: '#DC2626', 1: '#EA580C', 2: '#F59E0B',
    3: '#84CC16', 4: '#16A34A', 5: '#059669',
  };
  return colors[r] || '#6B7280';
}

export function getScoreSeverityColor(severity: ScoreInterpretation['severity']): string {
  const colors: Record<string, string> = {
    urgent: '#DC2626', major: '#EA580C', improvement: '#F59E0B',
    satisfactory: '#84CC16', good: '#16A34A',
  };
  return colors[severity] || '#6B7280';
}

export function formatRatingDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function daysSinceRating(dateStr: string): number {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
