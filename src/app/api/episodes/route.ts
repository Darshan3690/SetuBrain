import { NextResponse } from 'next/server';
import { getEpisodes } from '@/lib/memory';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || undefined;
  const episodes = getEpisodes(tenantId);

  return NextResponse.json({
    ok: true,
    count: episodes.length,
    episodes,
  });
}
