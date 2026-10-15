import { NextResponse } from 'next/server';
import { queryTenantGraph } from '@/lib/graphQueries';
import { getCuratorConflictStatus, getDepartmentHealthData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// MCP Tool Schemas (JSON Schema conforming to Model Context Protocol specification)
const MCP_TOOLS = [
  {
    name: 'setubrain_verify_policy_path',
    description: 'Traverses the multi-tenant FalkorDB graph to return verified, non-superseded corporate policies and procedures.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'string',
          enum: ['tenant_acme', 'tenant_globex'],
          description: 'Tenant graph partition to query (e.g. Acme Corp or Globex Inc)',
        },
        query: {
          type: 'string',
          description: 'Natural language question regarding company policy, expense limit, or procedure',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'setubrain_compile_skill_md',
    description: 'Compiles graph traversal facts into an executable SKILL.md specification for autonomous agents.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'string',
          enum: ['tenant_acme', 'tenant_globex'],
          description: 'Tenant identifier',
        },
        procedureId: {
          type: 'string',
          description: 'Procedure ID to compile (e.g. PROC-SAAS-01 or PROC-ENG-GPU)',
        },
      },
      required: ['procedureId'],
    },
  },
  {
    name: 'setubrain_curator_conflict_scan',
    description: 'Scans the knowledge graph topology for contradictory policies or active conflict flags requiring resolution.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'string',
          enum: ['tenant_acme', 'tenant_globex'],
          description: 'Target tenant graph to audit',
        },
      },
    },
  },
  {
    name: 'setubrain_route_to_sme',
    description: 'Resolves the authoritative Subject Matter Expert contact for an unverified department or topic.',
    inputSchema: {
      type: 'object',
      properties: {
        departmentSlug: {
          type: 'string',
          enum: ['finance', 'engineering', 'security', 'hr', 'operations'],
          description: 'Corporate department slug to route towards',
        },
      },
      required: ['departmentSlug'],
    },
  },
];

export async function GET() {
  return NextResponse.json({
    jsonrpc: '2.0',
    server: {
      name: 'setubrain-mcp-server',
      version: '1.0.0',
      description: 'FalkorDB Multi-Tenant Company Brain MCP Server (Track 01 & Track 03)',
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
      resources: {},
      prompts: {},
    },
    tools: MCP_TOOLS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jsonrpc = '2.0', id = 1, method, params } = body;

    // Handle tools/list
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc,
        id,
        result: {
          tools: MCP_TOOLS,
        },
      });
    }

    // Handle tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const tenantId = args.tenantId || 'tenant_acme';

      if (toolName === 'setubrain_verify_policy_path') {
        const queryText = args.query || 'How do I purchase software?';
        const result = await queryTenantGraph(tenantId, queryText, 'mcp_session');

        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  authoritativeAnswer: result.authoritativeAnswer,
                  graphPath: result.graphTraversalPath,
                  trapType: result.trapType,
                  supersededFiltered: result.supersededPolicies,
                  conflicts: result.conflictsDetected,
                  abstaining: result.abstentionNotice?.isAbstaining,
                  routedSME: result.abstentionNotice?.routedSME,
                }, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === 'setubrain_compile_skill_md') {
        const result = await queryTenantGraph(tenantId, 'How do I purchase software?', 'mcp_session');
        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: result.compiledSkillMd || '# No skill compiled for target procedure',
              },
            ],
          },
        });
      }

      if (toolName === 'setubrain_curator_conflict_scan') {
        const status = getCuratorConflictStatus();
        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  conflictStatus: status,
                  hasActiveConflicts: status === 'DETECTED',
                  conflicts: status === 'DETECTED' ? [
                    {
                      id: 'CONF-01',
                      policyA: 'POL-SEC-101 (Zero-Trust Endpoint Wipe)',
                      policyB: 'POL-HR-202 (Offboarding Grace Period)',
                      severity: 'CRITICAL',
                    }
                  ] : [],
                }, null, 2),
              },
            ],
          },
        });
      }

      if (toolName === 'setubrain_route_to_sme') {
        const deptSlug = args.departmentSlug || 'engineering';
        const depts = getDepartmentHealthData(tenantId);
        const match = depts.find(d => d.slug === deptSlug);

        return NextResponse.json({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(match ? {
                  department: match.name,
                  sme: match.sme,
                  healthScore: match.healthScore,
                } : { error: `Department ${deptSlug} not found` }, null, 2),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc,
        id,
        error: {
          code: -32601,
          message: `Method or tool '${toolName}' not found`,
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      jsonrpc,
      id,
      error: {
        code: -32600,
        message: `Unsupported MCP method '${method}'`,
      },
    }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'MCP execution failure';
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message,
      },
    }, { status: 500 });
  }
}
