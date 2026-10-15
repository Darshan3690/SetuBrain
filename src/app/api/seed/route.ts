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
  } catch (error: any) {
    console.error('FalkorDB Seed Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to seed FalkorDB' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
