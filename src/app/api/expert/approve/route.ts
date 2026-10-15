import { NextResponse } from 'next/server';
import { approveGpuProcedure, getGpuApprovalStatus } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const result = await approveGpuProcedure();
    return NextResponse.json({
      ok: true,
      message: 'GPU Cluster Quota procedure published live into FalkorDB as Marcus Vance (Principal Infra Architect)!',
      ...result,
    });
  } catch (error: any) {
    console.error('Expert Approve Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to approve procedure' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    isApproved: getGpuApprovalStatus(),
  });
}
