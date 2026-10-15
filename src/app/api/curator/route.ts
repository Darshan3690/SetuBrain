import { NextResponse } from 'next/server';
import { resolveCuratorConflict, getCuratorConflictStatus } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const status = getCuratorConflictStatus();
  return NextResponse.json({
    ok: true,
    conflictStatus: status,
    conflicts: status === 'DETECTED' ? [
      {
        id: 'CONF-01',
        procedureId: 'PROC-SEC-03',
        policyA: 'POL-SEC-101 (Zero-Trust Endpoint Wipe)',
        policyB: 'POL-HR-202 (Offboarding Grace Period)',
        description: 'Security mandates immediate 0-hour remote wipe via CrowdStrike Falcon upon departure, while HR mandates a 7-day grace period for personal tax document retrieval.',
        severity: 'CRITICAL',
        detectedBy: 'CuratorAgent',
        timestamp: '2026-10-15T12:00:00Z',
      }
    ] : [],
    resolution: status === 'RESOLVED' ? {
      winner: 'POL-SEC-101',
      action: 'SUPERSEDES',
      loser: 'POL-HR-202',
      rationale: 'Curator alignment: Zero-trust cryptographic wipe supersedes 7-day grace period for security compliance.',
      resolvedBy: 'CuratorAgent'
    } : null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'resolve') {
      const result = await resolveCuratorConflict();
      return NextResponse.json({
        ok: true,
        message: 'Curator Agent resolved policy contradiction: POL-SEC-101 formally marked as superseding POL-HR-202!',
        ...result,
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Curator Agent scanned graph.',
      status: getCuratorConflictStatus(),
    });
  } catch (error: any) {
    console.error('Curator API Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to execute curator action' },
      { status: 500 }
    );
  }
}
