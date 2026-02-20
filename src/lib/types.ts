// FSA API Types

export interface FSAEstablishment {
  FHRSID: number;
  BusinessName: string;
  BusinessType: string;
  BusinessTypeID: number;
  RatingValue: string;
  RatingDate: string;
  RatingKey: string;
  NewRatingPending: boolean;
  AddressLine1: string;
  AddressLine2: string;
  AddressLine3: string;
  AddressLine4: string;
  PostCode: string;
  LocalAuthorityName: string;
  LocalAuthorityCode: string;
  LocalAuthorityEmailAddress: string;
  LocalAuthorityWebSite: string;
  SchemeType: string;
  geocode: {
    longitude: string;
    latitude: string;
  };
  scores: {
    Hygiene: number | null;
    Structural: number | null;
    ConfidenceInManagement: number | null;
  };
  RightToReply: string;
}

export interface FSASearchResponse {
  establishments: FSAEstablishment[];
  meta: {
    dataSource: string;
    extractDate: string;
    itemCount: number;
    returncode: string | null;
    totalCount: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
  };
}

export interface ScoreInterpretation {
  area: 'Hygiene' | 'Structural' | 'ConfidenceInManagement';
  score: number;
  maxScore: number;
  label: string;
  severity: 'good' | 'satisfactory' | 'improvement' | 'major' | 'urgent';
  description: string;
  shortAdvice: string;
}

export interface RatingBreakdown {
  overall: {
    rating: number;
    label: string;
    description: string;
  };
  scores: ScoreInterpretation[];
  worstArea: string;
  primaryAction: string;
}

export interface SearchFilters {
  query: string;
  type: 'postcode' | 'name';
  businessTypeId?: number;
  localAuthorityId?: number;
  ratingKey?: number;
  ratingOperator?: 'Equal' | 'GreaterThanOrEqual' | 'LessThanOrEqual';
  pageNumber?: number;
  pageSize?: number;
}
