import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { role } = body;
    const validRoles = ['EMPLOYEE', 'DEPARTMENT_SME', 'KNOWLEDGE_MANAGER', 'COMPANY_ADMINISTRATOR'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ ok: false, error: 'Invalid role' }, { status: 400 });
    }

    if (!userId) {
      // Guest demo session: acknowledge role update without Clerk account requirement
      return NextResponse.json({ ok: true, role, guestMode: true });
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ ok: true, role, guestMode: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    console.error('Role Update Error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
