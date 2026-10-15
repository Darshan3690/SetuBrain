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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to approve procedure';
    console.error('Expert Approve Error:', message);
    return NextResponse.json(
      { ok: false, error: message },
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
