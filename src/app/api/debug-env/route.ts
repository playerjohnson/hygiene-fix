import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return NextResponse.json({
    url: url ? `${url.substring(0, 30)}...` : 'NOT SET',
    anon_set: anon.length > 0,
    anon_preview: anon ? `${anon.substring(0, 20)}...` : 'NOT SET',
    service_set: service.length > 0,
    service_preview: service ? `${service.substring(0, 20)}...` : 'NOT SET',
    service_has_role: service.includes('service_role'),
  });
}
