import { auth, clerkClient } from '@clerk/nextjs/server';

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
}

/**
 * Resolves the authenticated user's role and tenant from Clerk metadata.
 * Checks session claims, then live user public metadata, defaulting to 'EMPLOYEE' and 'tenant_acme'.
 */
export async function getSessionRoleContext(): Promise<UserSessionContext> {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return {
      userId: null,
      orgId: null,
      role: 'EMPLOYEE',
      tenantId: 'tenant_acme',
    };
  }

  // 1. Check custom claims if token template is configured in Clerk
  const claims = session.sessionClaims as Record<string, any> | undefined;
  let role = (claims?.metadata?.role || claims?.publicMetadata?.role) as UserRole | undefined;
  let tenantId = (claims?.metadata?.tenantId || claims?.publicMetadata?.tenantId) as string | undefined;

  // 2. Fall back to live user public metadata via Clerk backend client
  if (!role || !tenantId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      if (user) {
        if (!role) role = (user.publicMetadata?.role as UserRole) || 'EMPLOYEE';
        if (!tenantId) tenantId = (user.publicMetadata?.tenantId as string) || 'tenant_acme';
      }
    } catch (e) {
      console.warn('Failed to fetch user metadata from Clerk client:', e);
    }
  }

  return {
    userId,
    orgId: session.orgId || null,
    role: role || 'EMPLOYEE',
    tenantId: tenantId || 'tenant_acme',
  };
}

/**
 * Guard utility for API routes and server actions
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserSessionContext> {
  const context = await getSessionRoleContext();
  
  if (!context.userId) {
    throw new Error('Unauthorized: Please sign in with Clerk to access SetuBrain.');
  }

  if (!allowedRoles.includes(context.role) && context.role !== 'COMPANY_ADMINISTRATOR') {
    throw new Error(`Forbidden: Role '${context.role}' does not have sufficient permissions. Required: ${allowedRoles.join(' or ')}`);
  }

  return context;
}
