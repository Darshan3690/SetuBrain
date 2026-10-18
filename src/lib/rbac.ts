import { auth, clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export type UserRole = 
  | 'EMPLOYEE' 
  | 'DEPARTMENT_SME' 
  | 'KNOWLEDGE_MANAGER' 
  | 'COMPANY_ADMINISTRATOR';

export interface UserSessionContext {
  userId: string | null;
  orgId: string | null;
  role: UserRole;
  tenantId: string;
  isGuest?: boolean;
}

const VALID_ROLES: UserRole[] = [
  'EMPLOYEE',
  'DEPARTMENT_SME',
  'KNOWLEDGE_MANAGER',
  'COMPANY_ADMINISTRATOR',
];

/**
 * Resolves the authenticated user's role and tenant from Clerk metadata,
 * with graceful fallback to demo headers for guest exploration.
 */
export async function getSessionRoleContext(): Promise<UserSessionContext> {
  let demoRole: UserRole | null = null;
  let demoTenant = 'tenant_acme';

  try {
    const headerList = await headers();
    const roleHeader = headerList.get('x-demo-role');
    if (roleHeader && VALID_ROLES.includes(roleHeader as UserRole)) {
      demoRole = roleHeader as UserRole;
    }
    const tenantHeader = headerList.get('x-demo-tenant');
    if (tenantHeader) {
      demoTenant = tenantHeader;
    }
  } catch {
    // headers() might not be available in all contexts
  }

  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return {
      userId: demoRole ? 'demo_guest_user' : null,
      orgId: null,
      role: demoRole || 'EMPLOYEE',
      tenantId: demoTenant,
      isGuest: true,
    };
  }

  // 1. Check custom claims if token template is configured in Clerk
  const claims = session.sessionClaims as Record<string, Record<string, unknown>> | undefined;
  let role = (claims?.metadata?.role || claims?.publicMetadata?.role) as UserRole | undefined;
  let tenantId = (claims?.metadata?.tenantId || claims?.publicMetadata?.tenantId) as string | undefined;

  // 2. Fall back to live user public metadata via Clerk backend client
  if (!role || !tenantId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      if (user) {
        if (!role) role = (user.publicMetadata?.role as UserRole) || demoRole || 'EMPLOYEE';
        if (!tenantId) tenantId = (user.publicMetadata?.tenantId as string) || demoTenant;
      }
    } catch (e) {
      console.warn('Failed to fetch user metadata from Clerk client:', e);
    }
  }

  return {
    userId,
    orgId: session.orgId || null,
    role: role || demoRole || 'EMPLOYEE',
    tenantId: tenantId || demoTenant,
    isGuest: false,
  };
}

/**
 * Guard utility for API routes and server actions.
 * Allows demo sessions with x-demo-role to explore without authentication barriers.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserSessionContext> {
  const context = await getSessionRoleContext();
  
  // If guest mode is active, allow requested demo role if it fits
  if (context.isGuest) {
    if (allowedRoles.includes(context.role) || context.role === 'COMPANY_ADMINISTRATOR') {
      return context;
    }
    throw new Error(`Forbidden: Current demo role '${context.role}' does not have sufficient permissions. Required: ${allowedRoles.join(' or ')}`);
  }

  if (!context.userId) {
    throw new Error('Unauthorized: Please sign in or select an authorized role to access SetuBrain.');
  }

  if (!allowedRoles.includes(context.role) && context.role !== 'COMPANY_ADMINISTRATOR') {
    throw new Error(`Forbidden: Role '${context.role}' does not have sufficient permissions. Required: ${allowedRoles.join(' or ')}`);
  }

  return context;
}
