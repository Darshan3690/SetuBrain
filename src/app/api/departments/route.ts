import { NextResponse } from 'next/server';
import { getDepartmentHealthData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'tenant_acme';

    const departments = getDepartmentHealthData(tenantId);
    return NextResponse.json({
      ok: true,
      tenantId,
      departments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch departments';
    console.error('Departments API Error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
