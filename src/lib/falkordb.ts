import type { Graph } from 'falkordb';

export type TenantId = 'tenant_acme' | 'tenant_globex';

export const ALLOWED_TENANTS: Record<TenantId, { name: string; domain: string }> = {
  tenant_acme: { name: 'Acme Corp', domain: 'acme.com' },
  tenant_globex: { name: 'Globex Inc', domain: 'globex.io' },
};

let dbInstance: any = null;
let FalkorDBModule: any = null;
let isLiveFalkorDB = false;

export async function isLiveFalkorAvailable(): Promise<boolean> {
  try {
    const client = await getFalkorClient();
    const testGraph = client.selectGraph('test_ping');
    await testGraph.query('RETURN 1');
    isLiveFalkorDB = true;
    return true;
  } catch {
    isLiveFalkorDB = false;
    return false;
  }
}

export async function getFalkorClient(): Promise<any> {
  if (!FalkorDBModule) {
    const mod = await import('falkordb');
    FalkorDBModule = mod.FalkorDB || mod.default?.FalkorDB || mod;
  }

  if (!dbInstance) {
    dbInstance = await FalkorDBModule.connect({
      socket: {
        host: process.env.FALKORDB_HOST || '127.0.0.1',
        port: Number(process.env.FALKORDB_PORT || 6379),
        connectTimeout: 2000,
      },
      password: process.env.FALKORDB_PASSWORD || undefined,
    });
  }
  return dbInstance;
}

/**
 * Enforces tenant authorization and selects the isolated FalkorDB graph
 */
export async function getTenantGraph(tenantId: string): Promise<{
  graph: Graph;
  tenantName: string;
  graphKey: TenantId;
  isLive: boolean;
}> {
  if (!(tenantId in ALLOWED_TENANTS)) {
    throw new Error(`Unauthorized or unknown tenant graph: ${tenantId}`);
  }
  const validTenant = tenantId as TenantId;
  const client = await getFalkorClient();
  const graph = client.selectGraph(validTenant);

  return {
    graph,
    tenantName: ALLOWED_TENANTS[validTenant].name,
    graphKey: validTenant,
    isLive: isLiveFalkorDB,
  };
}
