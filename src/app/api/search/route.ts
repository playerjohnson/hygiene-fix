import { NextRequest, NextResponse } from 'next/server';
import { searchEstablishments } from '@/lib/fsa-api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const type = searchParams.get('type') as 'postcode' | 'name' || 'postcode';
  const page = parseInt(searchParams.get('page') || '1');

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Search query must be at least 2 characters' },
      { status: 400 }
    );
  }

  try {
    const data = await searchEstablishments({
      query,
      type,
      pageNumber: page,
      pageSize: 20,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('FSA search error:', error);
    return NextResponse.json(
      { error: 'Failed to search food hygiene ratings. Please try again.' },
      { status: 502 }
    );
  }
}
