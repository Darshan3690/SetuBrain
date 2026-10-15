import { NextResponse } from 'next/server';
import { seedSetuBrainGraphs } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const result = await seedSetuBrainGraphs();
    return NextResponse.json({
      ok: true,
      message: 'SetuBrain tenant graphs (tenant_acme & tenant_globex) seeded successfully!',
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to seed FalkorDB';
    console.error('FalkorDB Seed Error:', message);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
