import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { approveGpuProcedure, getGpuApprovalStatus } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    // 1. Enforce RBAC: Only SMEs, Knowledge Managers, or Admins can approve expert knowledge
    const userContext = await requireRole(['DEPARTMENT_SME', 'KNOWLEDGE_MANAGER', 'COMPANY_ADMINISTRATOR']);
    
    // 2. Execute live mutation to write approved knowledge into the FalkorDB graph
    const result = await approveGpuProcedure();

    return NextResponse.json({
      ok: true,
      message: 'Expert response approved and permanently written to FalkorDB knowledge graph!',
      publishedBy: userContext.userId,
      role: userContext.role,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to approve knowledge';
    console.error('Approval Error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 403 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    isApproved: getGpuApprovalStatus(),
  });
}
