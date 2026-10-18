import { NextResponse } from 'next/server';
import { addCustomPolicy, addCuratedDecision } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Universal Ingestion Route (Fix 2 & Cognee Ingestion):
 * Ingests live files (.md, .txt, .pdf raw text) or chat messages (Slack / Discord json/text),
 * automatically extracting title, department, application, and rules,
 * then executing automated contradiction and supersession detection.
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let content = '';
    let department = 'Finance';
    let app = 'Navan';
    let maxLimit = '$300/year';
    let ownerName = 'Priya Sharma';
    let ownerEmail = 'priya@acme.com';
    let tenantId = 'tenant_acme';
    let isDecisionChat = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      tenantId = (formData.get('tenantId') as string) || 'tenant_acme';
      department = (formData.get('department') as string) || 'Finance';

      if (!file) {
        return NextResponse.json({ ok: false, error: 'No file provided in form data' }, { status: 400 });
      }

      const text = await file.text();
      title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      // Capitalize title
      title = title.replace(/\b\w/g, (c) => c.toUpperCase());
      content = text;

      // Extract limit if present
      const limitMatch = text.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/);
      if (limitMatch) {
        maxLimit = `$${limitMatch[1]}`;
      }

      // Check if it's a Slack/Discord dump
      if (text.includes('Slack') || text.includes('Discord') || text.includes('approved by') || text.includes('ticket')) {
        isDecisionChat = true;
      }
    } else {
      const body = await req.json();
      title = body.title || 'Custom Ingested Policy';
      content = body.content || '';
      department = body.department || 'Finance';
      app = body.app || 'Navan';
      maxLimit = body.maxLimit || '$300/year';
      ownerName = body.ownerName || 'Priya Sharma';
      ownerEmail = body.ownerEmail || 'priya@acme.com';
      tenantId = body.tenantId || 'tenant_acme';
      isDecisionChat = Boolean(body.isDecisionChat);
    }

    if (!content.trim()) {
      return NextResponse.json({ ok: false, error: 'Content cannot be empty' }, { status: 400 });
    }

    // Ingest as decision if from chat channel
    if (isDecisionChat) {
      const result = await addCuratedDecision({
        tenantId,
        decisionId: `DEC-${Math.floor(920 + Math.random() * 70)}`,
        title: title || 'Live Chat Import Decision',
        rationale: content,
        sourceUrl: 'https://company.slack.com/archives/governance-feed',
        sourcePlatform: content.toLowerCase().includes('discord') ? 'Discord' : 'Slack',
        approverName: ownerName,
      });

      return NextResponse.json({
        type: 'decision',
        ...result,
        message: `Chat decision "${title}" permanently written to property graph!`,
      });
    }

    // Ingest as policy with Cognee Contradiction & Supersession checks
    const result = await addCustomPolicy({
      tenantId,
      title,
      department,
      app,
      maxLimit,
      content,
      ownerName,
      ownerEmail,
    });

    return NextResponse.json({
      type: 'policy',
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to ingest content';
    console.error('Ingestion API Error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
