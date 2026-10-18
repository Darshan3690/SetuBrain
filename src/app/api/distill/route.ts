import { NextResponse } from 'next/server';
import { addDistilledLesson } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Session Distillation Endpoint (inspired by Cognee session_distillation/distill.py):
 * Collects session interaction feedback and synthesizes proposed operational policy rules,
 * routing them into the Curator Review Queue for Knowledge Manager curation.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      query = '', 
      answerSummary = '', 
      feedback = 'thumbs_down',
      department = 'Finance',
      proposedPolicy = ''
    } = body;

    if (!query) {
      return NextResponse.json({ ok: false, error: 'Query is required for distillation' }, { status: 400 });
    }

    const synthesizedRule = proposedPolicy || 
      `Clarification for: "${query}". Verified protocol required: Documented departmental standard operating procedure governing ${department}.`;

    const lesson = addDistilledLesson({
      query,
      answerSummary: answerSummary.slice(0, 300),
      feedback: feedback === 'thumbs_up' ? 'thumbs_up' : 'thumbs_down',
      proposedPolicy: synthesizedRule,
      department,
    });

    return NextResponse.json({
      ok: true,
      message: 'Session interaction distilled into pending Curator review candidate!',
      lesson,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to distill session';
    console.error('Distill API Error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
