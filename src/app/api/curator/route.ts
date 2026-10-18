import { NextResponse } from 'next/server';
import { resolveCuratorConflict, getCuratorConflictStatus, getDistilledLessons, acceptDistilledLesson, addCustomPolicy } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const status = getCuratorConflictStatus();
  const distilled = getDistilledLessons();
  return NextResponse.json({
    ok: true,
    conflictStatus: status,
    distilledLessons: distilled,
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

    if (body.action === 'accept_distill') {
      const lesson = acceptDistilledLesson(body.lessonId);
      if (lesson) {
        // Automatically write distilled lesson into FalkorDB
        await addCustomPolicy({
          tenantId: 'tenant_acme',
          title: `Learned Policy: ${lesson.department} Guideline`,
          department: lesson.department,
          app: 'Navan',
          maxLimit: '$500',
          content: lesson.proposedPolicy,
          ownerName: 'Curator Agent',
          ownerEmail: 'curator@acme.internal',
        });
        return NextResponse.json({
          ok: true,
          message: `Distilled session lesson ${lesson.id} accepted and written to permanent knowledge graph!`,
          lesson,
        });
      }
      return NextResponse.json({ ok: false, error: 'Lesson not found' }, { status: 404 });
    }

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
      distilledLessons: getDistilledLessons(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to execute curator action';
    console.error('Curator API Error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
