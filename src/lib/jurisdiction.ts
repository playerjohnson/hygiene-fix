/**
 * UK jurisdiction detection for food hygiene ratings
 *
 * - England: FHRS (0–5 rating, voluntary display)
 * - Wales: FHRS (0–5 rating, MANDATORY display under Food Hygiene Rating (Wales) Act 2013)
 * - Northern Ireland: FHRS (0–5 rating, voluntary display)
 * - Scotland: FHIS (Pass/Improvement Required/Exempt, separate scheme)
 */

// Welsh local authorities (as of 2026)
const WELSH_AUTHORITIES = new Set([
  'Blaenau Gwent',
  'Bridgend',
  'Caerphilly',
  'Cardiff',
  'Carmarthenshire',
  'Ceredigion',
  'Conwy',
  'Denbighshire',
  'Flintshire',
  'Gwynedd',
  'Isle of Anglesey',
  'Merthyr Tydfil',
  'Monmouthshire',
  'Neath Port Talbot',
  'Newport',
  'Pembrokeshire',
  'Powys',
  'Rhondda Cynon Taf',
  'Swansea',
  'Torfaen',
  'Vale of Glamorgan',
  'Wrexham',
]);

// NI councils
const NI_AUTHORITIES = new Set([
  'Antrim and Newtownabbey',
  'Ards and North Down',
  'Armagh City, Banbridge and Craigavon',
  'Belfast',
  'Causeway Coast and Glens',
  'Derry City and Strabane',
  'Fermanagh and Omagh',
  'Lisburn and Castlereagh',
  'Mid and East Antrim',
  'Mid Ulster',
  'Newry, Mourne and Down',
]);

export type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

export interface JurisdictionInfo {
  jurisdiction: Jurisdiction;
  scheme: 'FHRS' | 'FHIS';
  displayMandatory: boolean;
  ratingType: 'numeric' | 'pass-fail';
  reinspectionAvailable: boolean;
  /** Jurisdiction-specific messaging for users */
  notices: string[];
}

export function detectJurisdiction(
  schemeType: string,
  localAuthorityName: string
): JurisdictionInfo {
  // Scotland uses FHIS
  if (schemeType === 'FHIS') {
    return {
      jurisdiction: 'scotland',
      scheme: 'FHIS',
      displayMandatory: false,
      ratingType: 'pass-fail',
      reinspectionAvailable: false,
      notices: [
        'Scotland uses the Food Hygiene Information Scheme (FHIS) with Pass/Improvement Required ratings — not the 0–5 scale used in England, Wales, and Northern Ireland.',
        'HygieneFix action plans are designed for the FHRS 0–5 rating system. Some guidance may not apply directly to Scottish inspections.',
        'In Scotland, reinspection requests are handled differently. Contact your local authority Environmental Health team for details.',
      ],
    };
  }

  // Wales — mandatory display
  if (WELSH_AUTHORITIES.has(localAuthorityName)) {
    return {
      jurisdiction: 'wales',
      scheme: 'FHRS',
      displayMandatory: true,
      ratingType: 'numeric',
      reinspectionAvailable: true,
      notices: [
        'Under the Food Hygiene Rating (Wales) Act 2013, you are legally required to display your food hygiene rating sticker at your premises. Failure to display can result in a fixed penalty notice.',
        'In Wales, the right to request a re-rating is a statutory right. Your local authority must offer reinspection within 3 months.',
      ],
    };
  }

  // Northern Ireland
  if (NI_AUTHORITIES.has(localAuthorityName)) {
    return {
      jurisdiction: 'northern-ireland',
      scheme: 'FHRS',
      displayMandatory: false,
      ratingType: 'numeric',
      reinspectionAvailable: true,
      notices: [],
    };
  }

  // Default: England
  return {
    jurisdiction: 'england',
    scheme: 'FHRS',
    displayMandatory: false,
    ratingType: 'numeric',
    reinspectionAvailable: true,
    notices: [],
  };
}
