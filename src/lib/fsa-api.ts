import { FSAEstablishment, FSASearchResponse, SearchFilters } from './types';

const FSA_BASE_URL = 'https://api.ratings.food.gov.uk';
const FSA_HEADERS = {
  'x-api-version': '2',
  'Accept': 'application/json',
};

export async function searchEstablishments(filters: SearchFilters): Promise<FSASearchResponse> {
  const params = new URLSearchParams();

  if (filters.type === 'postcode') {
    // Clean postcode: uppercase, ensure space
    const clean = filters.query.toUpperCase().replace(/\s+/g, '');
    const formatted = clean.length > 3
      ? clean.slice(0, -3) + ' ' + clean.slice(-3)
      : clean;
    params.set('address', formatted);
  } else {
    params.set('name', filters.query);
  }

  if (filters.businessTypeId && filters.businessTypeId > 0) {
    params.set('businessTypeId', String(filters.businessTypeId));
  }
  if (filters.localAuthorityId && filters.localAuthorityId > 0) {
    params.set('localAuthorityId', String(filters.localAuthorityId));
  }
  if (filters.ratingKey !== undefined) {
    params.set('ratingKey', String(filters.ratingKey));
  }
  if (filters.ratingOperator) {
    params.set('ratingOperatorKey', filters.ratingOperator);
  }

  params.set('pageNumber', String(filters.pageNumber || 1));
  params.set('pageSize', String(filters.pageSize || 20));
  params.set('sortOptionKey', 'rating');

  const url = `${FSA_BASE_URL}/Establishments?${params.toString()}`;

  const res = await fetch(url, {
    headers: FSA_HEADERS,
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`FSA API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getEstablishment(fhrsid: number): Promise<FSAEstablishment | null> {
  const url = `${FSA_BASE_URL}/Establishments/${fhrsid}`;

  const res = await fetch(url, {
    headers: FSA_HEADERS,
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`FSA API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getLowRatedByAuthority(
  authorityId: number,
  maxRating: number = 2,
  page: number = 1,
  pageSize: number = 50
): Promise<FSASearchResponse> {
  const params = new URLSearchParams({
    localAuthorityId: String(authorityId),
    ratingKey: String(maxRating),
    ratingOperatorKey: 'LessThanOrEqual',
    pageNumber: String(page),
    pageSize: String(pageSize),
    sortOptionKey: 'rating',
  });

  const url = `${FSA_BASE_URL}/Establishments?${params.toString()}`;

  const res = await fetch(url, {
    headers: FSA_HEADERS,
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`FSA API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getAuthorities(): Promise<{ authorities: { LocalAuthorityId: number; Name: string }[] }> {
  const res = await fetch(`${FSA_BASE_URL}/Authorities/basic`, {
    headers: FSA_HEADERS,
    next: { revalidate: 86400 }, // Cache 24h
  });

  if (!res.ok) throw new Error(`FSA API error: ${res.status}`);
  return res.json();
}

export async function getRatingCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const rating of [0, 1, 2, 3]) {
    const params = new URLSearchParams({
      ratingKey: String(rating),
      ratingOperatorKey: 'Equal',
      pageSize: '1',
      pageNumber: '1',
    });

    const res = await fetch(`${FSA_BASE_URL}/Establishments?${params}`, {
      headers: FSA_HEADERS,
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      counts[String(rating)] = data.meta?.totalCount || 0;
    }
  }

  return counts;
}

export interface AuthorityStats {
  distribution: { rating: number; count: number }[];
  total: number;
  lowRatedTotal: number;
  lowRatedPercent: number;
}

export async function getAuthorityRatingDistribution(authorityId: number): Promise<AuthorityStats> {
  const ratings = [0, 1, 2, 3, 4, 5];

  const counts = await Promise.all(
    ratings.map(async (rating) => {
      const params = new URLSearchParams({
        localAuthorityId: String(authorityId),
        ratingKey: String(rating),
        ratingOperatorKey: 'Equal',
        pageSize: '1',
      });

      try {
        const res = await fetch(`${FSA_BASE_URL}/Establishments?${params}`, {
          headers: FSA_HEADERS,
          next: { revalidate: 86400 },
        });
        if (!res.ok) return { rating, count: 0 };
        const data = await res.json();
        return { rating, count: data.meta?.totalCount || 0 };
      } catch {
        return { rating, count: 0 };
      }
    })
  );

  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const lowRatedTotal = counts.filter((c) => c.rating <= 2).reduce((sum, c) => sum + c.count, 0);

  return {
    distribution: counts,
    total,
    lowRatedTotal,
    lowRatedPercent: total > 0 ? Math.round((lowRatedTotal / total) * 100) : 0,
  };
}
