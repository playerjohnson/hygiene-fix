import { NextResponse } from 'next/server';
import { getRatingCounts } from '@/lib/fsa-api';

export async function GET() {
  try {
    const counts = await getRatingCounts();
    return NextResponse.json(counts);
  } catch (error) {
    console.error('Ratings data error:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings data' }, { status: 502 });
  }
}
