import { NextResponse } from 'next/server';
import { addCustomPolicy, addCuratedDecision } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'import_decision') {
      const result = await addCuratedDecision({
        tenantId: body.tenantId || 'tenant_acme',
        decisionId: body.decisionId || `DEC-${Math.floor(900 + Math.random() * 99)}`,
        title: body.title,
        rationale: body.rationale,
        sourceUrl: body.sourceUrl || 'https://acme.slack.com/archives/C01/p1759401',
        sourcePlatform: body.sourcePlatform || 'Slack',
        approverName: body.approverName || 'Priya Sharma',
      });
      return NextResponse.json({ ...result });
    }

    // Default: Custom Policy creation
    const result = await addCustomPolicy({
      tenantId: body.tenantId || 'tenant_acme',
      title: body.title || 'Remote Work & Home Office Monitor Stipend',
      department: body.department || 'Finance',
      app: body.app || 'Navan',
      maxLimit: body.maxLimit || '$300/year',
      content: body.content || 'Employees can expense up to $300/year for home office monitors, keyboards, and ergonomic gear via Navan. Auto-approved by Priya Sharma.',
      ownerName: body.ownerName || 'Priya Sharma',
      ownerEmail: body.ownerEmail || 'priya@acme.com',
    });

    return NextResponse.json({ ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish policy';
    console.error('Policy Creation Error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
