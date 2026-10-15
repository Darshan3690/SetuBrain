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
  } catch (error: any) {
    console.error('Departments API Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}
