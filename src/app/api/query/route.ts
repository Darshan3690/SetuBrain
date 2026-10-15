import { NextResponse } from 'next/server';
import { queryTenantGraph } from '@/lib/graphQueries';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId = 'tenant_acme', query = 'How do I purchase software?' } = body;

    const result = await queryTenantGraph(tenantId, query);
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to execute graph query';
    console.error('SetuBrain Query Error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
