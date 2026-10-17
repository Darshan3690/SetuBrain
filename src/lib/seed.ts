import { getTenantGraph } from './falkordb';

export type PropertyValue = string | number | boolean | null | undefined | string[];

// In-memory fallback dataset for when FalkorDB container is offline
export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, PropertyValue>;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
  properties?: Record<string, PropertyValue>;
}

export interface FallbackTenantGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const fallbackStore: Record<string, FallbackTenantGraph> = {
  tenant_acme: { nodes: [], edges: [] },
  tenant_globex: { nodes: [], edges: [] },
};

export let isGpuProcedureApproved = false;
export let curatorConflictStatus: 'DETECTED' | 'RESOLVED' = 'DETECTED';

export function getGpuApprovalStatus(): boolean {
  return isGpuProcedureApproved;
}

export function getCuratorConflictStatus(): 'DETECTED' | 'RESOLVED' {
  return curatorConflictStatus;
}

export async function approveGpuProcedure() {
  isGpuProcedureApproved = true;

  // Add to fallback store
  const acme = fallbackStore.tenant_acme;
  if (!acme.nodes.some(n => n.id === 'PROC-ENG-GPU')) {
    acme.nodes.push(
      {
        id: 'APP-RUNAI',
        labels: ['Application'],
        properties: {
          name: 'Run:ai Orchestrator',
          purpose: 'Self-serve GPU cluster scheduling and workload isolation',
          url: 'https://runai.infra.acme.internal',
          access_procedure: 'Auto-provisioned via Okta Engineering Group',
          sensitivity: 'HIGH'
        }
      },
      {
        id: 'PROC-ENG-GPU',
        labels: ['Procedure'],
        properties: {
          title: 'GPU Cluster Quota & AI Compute Allocation Request',
          steps: '1. Access Run:ai Orchestrator via Okta. 2. Select project workspace (e.g. #hackathon-2026). 3. Up to 8x NVIDIA H100 GPUs are auto-approved for 72-hour sessions. 4. Workloads requesting >8 GPUs require Principal Architect (Marcus Vance) authorization.',
          completion_time: 'Instant (<5 minutes) for <=8 GPUs; 12 hours for custom clusters',
          exceptions: 'External client demos approved by Engineering VP',
          status: 'APPROVED',
          effective_date: '2026-10-15',
          review_date: '2027-10-15'
        }
      },
      {
        id: 'POL-ENG-GPU-2026',
        labels: ['Policy'],
        properties: {
          title: '2026 GPU Cluster Allocation & Compute Governance Policy',
          content: 'All high-performance computing (NVIDIA H100/A100 clusters) must be provisioned via Run:ai. Hackathons and experimental spikes have an auto-approved quota of up to 8x H100s for up to 72 hours. Larger cluster allocations require sign-off from Principal Infrastructure Architect (Marcus Vance).',
          status: 'APPROVED',
          version: '1.0',
          effective_date: '2026-10-15',
          review_date: '2027-10-15',
          confidence: 1.0
        }
      }
    );

    acme.edges.push(
      { from: 'DEPT-ENG', to: 'APP-RUNAI', type: 'OWNS' },
      { from: 'DEPT-ENG', to: 'PROC-ENG-GPU', type: 'RESPONSIBLE_FOR' },
      { from: 'PROC-ENG-GPU', to: 'APP-RUNAI', type: 'USES_APP' },
      { from: 'PROC-ENG-GPU', to: 'POL-ENG-GPU-2026', type: 'GOVERNED_BY' },
      { from: 'POL-ENG-GPU-2026', to: 'SME-MARCUS', type: 'APPROVED_BY' }
    );
  }

  // Attempt live FalkorDB write
  try {
    const { graph } = await getTenantGraph('tenant_acme');
    await graph.query(`
      MATCH (deptEng:Department {id: 'DEPT-ENG'}), (smeMarcus:Contact {id: 'SME-MARCUS'})
      MERGE (appRunai:Application {id: 'APP-RUNAI'})
        ON CREATE SET appRunai.name = 'Run:ai Orchestrator', appRunai.purpose = 'Self-serve GPU cluster scheduling', appRunai.url = 'https://runai.infra.acme.internal'
      MERGE (procGpu:Procedure {id: 'PROC-ENG-GPU'})
        ON CREATE SET procGpu.title = 'GPU Cluster Quota & AI Compute Allocation Request',
                      procGpu.steps = '1. Access Run:ai Orchestrator. 2. Select project workspace. 3. Up to 8x H100 GPUs auto-approved for 72 hrs. 4. Over 8 GPUs route to Marcus Vance.',
                      procGpu.status = 'APPROVED', procGpu.effective_date = '2026-10-15'
      MERGE (polGpu:Policy {id: 'POL-ENG-GPU-2026'})
        ON CREATE SET polGpu.title = '2026 GPU Cluster Allocation Policy', polGpu.status = 'APPROVED', polGpu.version = '1.0'
      MERGE (deptEng)-[:OWNS]->(appRunai)
      MERGE (deptEng)-[:RESPONSIBLE_FOR]->(procGpu)
      MERGE (procGpu)-[:USES_APP]->(appRunai)
      MERGE (procGpu)-[:GOVERNED_BY]->(polGpu)
      MERGE (polGpu)-[:APPROVED_BY]->(smeMarcus)
    `);
  } catch {
    // live db optional
  }

  return { success: true, procedureId: 'PROC-ENG-GPU', author: 'Marcus Vance' };
}

export async function resolveCuratorConflict() {
  curatorConflictStatus = 'RESOLVED';

  // Update fallback store: replace CONFLICTS_WITH with SUPERSEDES
  const acme = fallbackStore.tenant_acme;
  acme.edges = acme.edges.filter(e => e.type !== 'CONFLICTS_WITH');
  if (!acme.edges.some(e => e.from === 'POL-SEC-101' && e.to === 'POL-HR-202')) {
    acme.edges.push({
      from: 'POL-SEC-101',
      to: 'POL-HR-202',
      type: 'SUPERSEDES',
      properties: {
        reason: 'Executive alignment: Zero-Trust cryptographic wipe supersedes 7-day grace period for security compliance.',
        resolved_by: 'CuratorAgent',
        resolution_date: new Date().toISOString().split('T')[0]
      }
    });
  }

  // Attempt live FalkorDB resolution
  try {
    const { graph } = await getTenantGraph('tenant_acme');
    await graph.query(`
      MATCH (p1:Policy {id: 'POL-SEC-101'})-[r:CONFLICTS_WITH]->(p2:Policy {id: 'POL-HR-202'})
      DELETE r
      MERGE (p1)-[:SUPERSEDES {reason: 'Curator alignment: Zero-trust wipe supersedes grace period', resolved_by: 'CuratorAgent'}]->(p2)
    `);
  } catch {
    // live db optional
  }

  return {
    success: true,
    status: 'RESOLVED',
    precedence: 'POL-SEC-101 supersedes POL-HR-202',
  };
}

export interface CustomPolicyInput {
  tenantId?: string;
  title: string;
  department?: string;
  app?: string;
  maxLimit?: string;
  content: string;
  ownerName?: string;
  ownerEmail?: string;
}

export async function addCustomPolicy(input: CustomPolicyInput) {
  const tenantKey = (input.tenantId === 'tenant_globex' ? 'tenant_globex' : 'tenant_acme');
  const store = fallbackStore[tenantKey];
  
  const safeSlug = input.title.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase() || 'CUSTOM';
  const polId = `POL-${safeSlug}-${Math.floor(100 + Math.random() * 900)}`;
  const procId = `PROC-${safeSlug}-${Math.floor(100 + Math.random() * 900)}`;
  const appId = `APP-${(input.app || 'Navan').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)}`;
  const contactId = `SME-${(input.ownerName || 'Priya').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)}`;
  const deptSlug = (input.department || 'Finance').toLowerCase();
  const deptId = deptSlug.includes('eng') ? 'DEPT-ENG' : deptSlug.includes('sec') ? 'DEPT-SEC' : deptSlug.includes('hr') ? 'DEPT-HR' : deptSlug.includes('ops') ? 'DEPT-OPS' : 'DEPT-FIN';

  // Add Policy Node
  store.nodes.push({
    id: polId,
    labels: ['Policy'],
    properties: {
      title: input.title,
      content: input.content,
      status: 'APPROVED',
      version: '1.0',
      maxLimit: input.maxLimit || '$300/year',
      effective_date: new Date().toISOString().split('T')[0],
      review_date: '2027-10-15',
      confidence: 1.0,
      owner: input.ownerName || 'Priya Sharma',
      ownerEmail: input.ownerEmail || 'priya@acme.com',
    }
  });

  // Add Procedure Node
  store.nodes.push({
    id: procId,
    labels: ['Procedure'],
    properties: {
      title: `${input.title} Workflow`,
      steps: input.content,
      status: 'APPROVED',
      effective_date: new Date().toISOString().split('T')[0],
      review_date: '2027-10-15',
    }
  });

  // Ensure App exists
  if (!store.nodes.some(n => n.id === appId)) {
    store.nodes.push({
      id: appId,
      labels: ['Application'],
      properties: {
        name: input.app || 'Navan',
        purpose: 'Corporate workflow portal',
        url: `https://${(input.app || 'app').toLowerCase().replace(/\s+/g, '')}.company.internal`,
        access_procedure: 'SSO via Okta',
        sensitivity: 'MEDIUM',
      }
    });
  }

  // Ensure Contact exists
  if (!store.nodes.some(n => n.id === contactId)) {
    store.nodes.push({
      id: contactId,
      labels: ['Contact'],
      properties: {
        name: input.ownerName || 'Priya Sharma',
        email: input.ownerEmail || 'priya@acme.com',
        role: 'SME',
        title: 'Policy Owner',
      }
    });
  }

  // Connect Edges
  store.edges.push(
    { from: deptId, to: procId, type: 'RESPONSIBLE_FOR' },
    { from: procId, to: appId, type: 'USES_APP' },
    { from: procId, to: polId, type: 'GOVERNED_BY' },
    { from: polId, to: contactId, type: 'APPROVED_BY' }
  );

  // Attempt live FalkorDB write
  try {
    const { graph } = await getTenantGraph(tenantKey);
    await graph.query(`
      MATCH (d:Department {id: '${deptId}'})
      MERGE (app:Application {id: '${appId}'})
        ON CREATE SET app.name = '${input.app || 'Navan'}'
      MERGE (sme:Contact {id: '${contactId}'})
        ON CREATE SET sme.name = '${input.ownerName || 'Priya Sharma'}', sme.email = '${input.ownerEmail || 'priya@acme.com'}'
      CREATE (proc:Procedure {id: '${procId}', title: '${input.title.replace(/'/g, "\\'")} Workflow', steps: '${input.content.replace(/'/g, "\\'")}', status: 'APPROVED'})
      CREATE (pol:Policy {id: '${polId}', title: '${input.title.replace(/'/g, "\\'")}', content: '${input.content.replace(/'/g, "\\'")}', maxLimit: '${input.maxLimit || '$300/year'}', status: 'APPROVED', review_date: '2027-10-15'})
      MERGE (d)-[:RESPONSIBLE_FOR]->(proc)
      MERGE (proc)-[:USES_APP]->(app)
      MERGE (proc)-[:GOVERNED_BY]->(pol)
      MERGE (pol)-[:APPROVED_BY]->(sme)
    `);
  } catch {
    // live db optional
  }

  return {
    ok: true,
    policyId: polId,
    procedureId: procId,
    title: input.title,
    message: `Policy "${input.title}" published live into ${tenantKey} graph!`,
  };
}

export interface CuratedDecisionInput {
  tenantId?: string;
  decisionId: string;
  title: string;
  rationale: string;
  sourceUrl: string;
  sourcePlatform: 'Slack' | 'Discord' | 'Jira' | 'Email';
  approverName?: string;
  approverEmail?: string;
}

export async function addCuratedDecision(input: CuratedDecisionInput) {
  const tenantKey = (input.tenantId === 'tenant_globex' ? 'tenant_globex' : 'tenant_acme');
  const store = fallbackStore[tenantKey];

  const docId = `DOC-${input.decisionId}`;
  const smeId = 'SME-PRIYA';

  // Add Decision Node if not present
  if (!store.nodes.some(n => n.id === input.decisionId)) {
    store.nodes.push({
      id: input.decisionId,
      labels: ['Decision'],
      properties: {
        title: input.title,
        rationale: input.rationale,
        timestamp: new Date().toISOString(),
      }
    });
  }

  // Add Document Node
  if (!store.nodes.some(n => n.id === docId)) {
    store.nodes.push({
      id: docId,
      labels: ['Document'],
      properties: {
        title: `${input.sourcePlatform} Thread Proof: ${input.title}`,
        source_type: input.sourcePlatform,
        url: input.sourceUrl,
        created_at: new Date().toISOString().split('T')[0],
      }
    });
  }

  // Connect edges
  if (!store.edges.some(e => e.from === input.decisionId && e.to === docId)) {
    store.edges.push({ from: input.decisionId, to: docId, type: 'SUPPORTED_BY' });
  }
  if (!store.edges.some(e => e.from === input.decisionId && e.to === smeId)) {
    store.edges.push({ from: input.decisionId, to: smeId, type: 'APPROVED_BY' });
  }

  // Attempt live FalkorDB write
  try {
    const { graph } = await getTenantGraph(tenantKey);
    await graph.query(`
      MATCH (sme:Contact {id: '${smeId}'})
      MERGE (dec:Decision {id: '${input.decisionId}'})
        ON CREATE SET dec.title = '${input.title.replace(/'/g, "\\'")}', dec.rationale = '${input.rationale.replace(/'/g, "\\'")}'
      MERGE (doc:Document {id: '${docId}'})
        ON CREATE SET doc.title = '${input.sourcePlatform} Thread Proof', doc.source_type = '${input.sourcePlatform}', doc.url = '${input.sourceUrl}'
      MERGE (dec)-[:SUPPORTED_BY]->(doc)
      MERGE (dec)-[:APPROVED_BY]->(sme)
    `);
  } catch {
    // live db optional
  }

  return {
    ok: true,
    decisionId: input.decisionId,
    title: input.title,
    message: `Decision "${input.decisionId}" imported with ${input.sourcePlatform} provenance into FalkorDB!`,
  };
}

export function getDepartmentHealthData(tenantId: string = 'tenant_acme') {
  if (tenantId === 'tenant_globex') {
    return [
      {
        id: 'GLX-FIN',
        name: 'Finance',
        slug: 'finance',
        sme: { name: 'Hans Gruber', email: 'hans@globex.io', role: 'CFO' },
        apps: ['Brex'],
        proceduresCount: 1,
        activePoliciesCount: 1,
        openConflicts: 0,
        unansweredEscalations: 0,
        healthScore: 100,
        status: 'HEALTHY' as const,
      }
    ];
  }

  const isConflictOpen = curatorConflictStatus === 'DETECTED';
  const isGpuPending = !isGpuProcedureApproved;

  return [
    {
      id: 'DEPT-FIN',
      name: 'Finance',
      slug: 'finance',
      sme: { name: 'Priya Sharma', email: 'priya@acme.com', role: 'VP of Finance' },
      apps: ['Ramp', 'Navan'],
      proceduresCount: 2,
      activePoliciesCount: 2,
      openConflicts: 0,
      unansweredEscalations: 0,
      healthScore: 100,
      status: 'HEALTHY' as const,
    },
    {
      id: 'DEPT-ENG',
      name: 'Engineering',
      slug: 'engineering',
      sme: { name: 'Marcus Vance', email: 'marcus@acme.com', role: 'Principal Infra Architect' },
      apps: isGpuProcedureApproved ? ['Run:ai Orchestrator'] : [],
      proceduresCount: isGpuProcedureApproved ? 1 : 0,
      activePoliciesCount: isGpuProcedureApproved ? 1 : 0,
      openConflicts: 0,
      unansweredEscalations: isGpuPending ? 1 : 0,
      healthScore: isGpuPending ? 70 : 100,
      status: isGpuPending ? ('ATTENTION' as const) : ('HEALTHY' as const),
    },
    {
      id: 'DEPT-SEC',
      name: 'Security',
      slug: 'security',
      sme: { name: 'Elena Rostova', email: 'elena@acme.com', role: 'Head of InfoSec' },
      apps: ['CrowdStrike Falcon'],
      proceduresCount: 1,
      activePoliciesCount: 1,
      openConflicts: isConflictOpen ? 1 : 0,
      unansweredEscalations: 0,
      healthScore: isConflictOpen ? 60 : 98,
      status: isConflictOpen ? ('CRITICAL' as const) : ('HEALTHY' as const),
    },
    {
      id: 'DEPT-HR',
      name: 'Human Resources',
      slug: 'hr',
      sme: { name: 'David Kim', email: 'david@acme.com', role: 'HR Compliance Lead' },
      apps: [],
      proceduresCount: 1,
      activePoliciesCount: 1,
      openConflicts: isConflictOpen ? 1 : 0,
      unansweredEscalations: 0,
      healthScore: isConflictOpen ? 60 : 98,
      status: isConflictOpen ? ('CRITICAL' as const) : ('HEALTHY' as const),
    },
    {
      id: 'DEPT-OPS',
      name: 'Operations',
      slug: 'operations',
      sme: { name: 'Priya Sharma', email: 'priya@acme.com', role: 'Approver' },
      apps: ['Stripe Ops Portal'],
      proceduresCount: 1,
      activePoliciesCount: 1,
      openConflicts: 0,
      unansweredEscalations: 0,
      healthScore: 100,
      status: 'HEALTHY' as const,
    },
  ];
}


export async function seedSetuBrainGraphs() {
  isGpuProcedureApproved = false;
  curatorConflictStatus = 'DETECTED';
  let acmeLiveSeeded = false;
  let globexLiveSeeded = false;

  // ============================================================================
  // 1. POPULATE FALLBACK IN-MEMORY STORE (Always available for zero-failure dev)
  // ============================================================================
  fallbackStore.tenant_acme = {
    nodes: [
      // Departments
      { id: 'DEPT-FIN', labels: ['Department'], properties: { name: 'Finance', slug: 'finance', description: 'Corporate budgets, SaaS procurement, and expense reimbursements' } },
      { id: 'DEPT-ENG', labels: ['Department'], properties: { name: 'Engineering', slug: 'engineering', description: 'Cloud infrastructure, CI/CD, and AI/GPU compute clusters' } },
      { id: 'DEPT-SEC', labels: ['Department'], properties: { name: 'Security', slug: 'security', description: 'Device security, VPN access, and incident response' } },
      { id: 'DEPT-HR', labels: ['Department'], properties: { name: 'Human Resources', slug: 'hr', description: 'Employee onboarding, leave tracking, and offboarding' } },
      { id: 'DEPT-OPS', labels: ['Department'], properties: { name: 'Operations', slug: 'operations', description: 'Customer billing exceptions and enterprise SLA management' } },
      // SMEs
      { id: 'SME-PRIYA', labels: ['Contact'], properties: { name: 'Priya Sharma', email: 'priya@acme.com', role: 'SME', title: 'VP of Finance' } },
      { id: 'SME-MARCUS', labels: ['Contact'], properties: { name: 'Marcus Vance', email: 'marcus@acme.com', role: 'SME', title: 'Principal Infra Architect' } },
      { id: 'SME-ELENA', labels: ['Contact'], properties: { name: 'Elena Rostova', email: 'elena@acme.com', role: 'SME', title: 'Head of InfoSec' } },
      { id: 'SME-DAVID', labels: ['Contact'], properties: { name: 'David Kim', email: 'david@acme.com', role: 'SME', title: 'HR Compliance Lead' } },
      // Apps
      { id: 'APP-RAMP', labels: ['Application'], properties: { name: 'Ramp', purpose: 'Corporate cards, SaaS procurement, and expense approvals', url: 'https://app.ramp.com', access_procedure: 'SSO via Okta', sensitivity: 'HIGH' } },
      { id: 'APP-NAVAN', labels: ['Application'], properties: { name: 'Navan', purpose: 'Flight and hotel travel booking', url: 'https://app.navan.com', access_procedure: 'Auto-provisioned on Day 1', sensitivity: 'MEDIUM' } },
      { id: 'APP-CROWD', labels: ['Application'], properties: { name: 'CrowdStrike Falcon', purpose: 'Endpoint security and remote laptop lock/wipe', url: 'https://falcon.crowdstrike.com', access_procedure: 'Restricted to Security Admin', sensitivity: 'CRITICAL' } },
      { id: 'APP-STRIPE', labels: ['Application'], properties: { name: 'Stripe Ops Portal', purpose: 'Customer refunds and billing adjustments', url: 'https://dashboard.stripe.com', access_procedure: 'Request via Operations', sensitivity: 'HIGH' } },
      // Documents
      { id: 'DOC-FIN-2026', labels: ['Document'], properties: { title: '2026 SaaS Procurement Handbook v3.md', source_type: 'Markdown', url: '/docs/saas-procurement-2026.md', created_at: '2026-01-15' } },
      { id: 'DOC-TRV-2024', labels: ['Document'], properties: { title: '2024 Legacy Travel Policy.pdf', source_type: 'PDF', url: '/docs/legacy-travel-2024.pdf', created_at: '2024-03-10' } },
      { id: 'DOC-TRV-2026', labels: ['Document'], properties: { title: '2026 Updated Travel & Hotel Policy.md', source_type: 'Markdown', url: '/docs/travel-policy-2026.md', created_at: '2026-02-01' } },
      { id: 'DOC-SLACK-901', labels: ['Document'], properties: { title: 'Slack #exec-approvals Thread (Oct 2, 2026)', source_type: 'Slack', url: 'https://acme.slack.com/archives/C01/p1759401', created_at: '2026-10-02' } },
      // Trap 1: Multi-Hop
      { id: 'PROC-SAAS-01', labels: ['Procedure'], properties: { title: 'Software Purchase & SaaS Budget Request', steps: '1. Check duplicate tools in Ramp. 2. Submit SaaS Request Form in Ramp for amounts up to $500/mo. 3. Attach SOC2 report for new vendors. 4. Route to Priya Sharma if annual contract exceeds $5,000.', completion_time: '24 hours', exceptions: 'Emergency production tooling approved by Engineering VP', status: 'APPROVED', effective_date: '2026-01-15', review_date: '2027-01-15' } },
      { id: 'POL-FIN-2026', labels: ['Policy'], properties: { title: '2026 SaaS Procurement Governance Policy', content: 'All new software subscriptions must be requested through Ramp. Self-serve auto-approval applies under $500/month. Contracts above $5,000/year require VP Finance (Priya Sharma) sign-off.', status: 'APPROVED', version: '3.0', effective_date: '2026-01-15', review_date: '2027-01-15', confidence: 1.0 } },
      // Trap 2: Superseded
      { id: 'PROC-TRV-02', labels: ['Procedure'], properties: { title: 'Employee Hotel & Travel Expense Reimbursement', steps: '1. Book hotel through Navan portal. 2. Nightly cap is $250/night for Tier-1 cities. 3. Upload itemized receipt within 14 days.', completion_time: '3 business days', exceptions: 'Conference headquarters hotel rate matched with manager note', status: 'APPROVED', effective_date: '2026-02-01', review_date: '2027-02-01' } },
      { id: 'POL-EXP-2024', labels: ['Policy'], properties: { title: '2024 Hotel Reimbursement Policy (Legacy)', content: 'Employees may expense up to $150 per night for business hotels. Receipts must be emailed to finance@acme.com.', status: 'SUPERSEDED', version: '1.0', effective_date: '2024-03-10', review_date: '2025-03-10', confidence: 0.4 } },
      { id: 'POL-EXP-2026', labels: ['Policy'], properties: { title: '2026 Global Travel & Hotel Policy', content: 'Effective Feb 2026, the hotel lodging limit is $250 per night when booked via Navan. This policy formally supersedes POL-EXP-2024 ($150 cap).', status: 'APPROVED', version: '2.0', effective_date: '2026-02-01', review_date: '2027-02-01', confidence: 1.0 } },
      // Trap 3: Conflict
      { id: 'PROC-SEC-03', labels: ['Procedure'], properties: { title: 'Remote Laptop Wipe & Contractor Offboarding', steps: 'Trigger endpoint lock and remote wipe via CrowdStrike Falcon upon contract termination.', completion_time: 'Immediate vs 7 Days (Conflicting)', exceptions: 'Legal hold devices', status: 'APPROVED', effective_date: '2026-04-01', review_date: '2026-12-31' } },
      { id: 'POL-SEC-101', labels: ['Policy'], properties: { title: 'Zero-Trust Endpoint Wipe Mandate', content: 'Security requires immediate 0-hour remote cryptographic wipe via CrowdStrike Falcon the moment a contractor or employee offboarding ticket is filed.', status: 'APPROVED', version: '1.2', effective_date: '2026-04-01', review_date: '2026-12-31', confidence: 0.9 } },
      { id: 'POL-HR-202', labels: ['Policy'], properties: { title: 'Employee & Contractor Offboarding Grace Period Policy', content: 'IT and Security must wait 7 calendar days after final employment date before wiping laptops so departing staff can retrieve personal tax documents.', status: 'APPROVED', version: '1.4', effective_date: '2026-04-10', review_date: '2026-12-31', confidence: 0.9 } },
      // Trap 5: Decision Provenance
      { id: 'PROC-OPS-05', labels: ['Procedure'], properties: { title: 'Enterprise Customer Refund Exception Workflow', steps: '1. Verify SLA breach metrics. 2. Check POL-OPS-300 cap. 3. Execute refund in Stripe Ops Portal.', completion_time: '4 hours', exceptions: 'Requires VP Finance approval above $1,000', status: 'APPROVED', effective_date: '2026-05-01', review_date: '2027-05-01' } },
      { id: 'POL-OPS-300', labels: ['Policy'], properties: { title: 'Enterprise SLA Credit & Refund Exception Policy', content: 'Cash refunds above $1,000 on annual enterprise plans are permitted if uptime drops below 99.5% and VP Finance approves in #exec-approvals.', status: 'APPROVED', version: '2.1', effective_date: '2026-05-01', review_date: '2027-05-01', confidence: 1.0 } },
      { id: 'DEC-901', labels: ['Decision'], properties: { title: 'Approved $1,500 Annual Refund Exception for CloudScale Inc (Ticket #TKT-4402)', rationale: 'Customer experienced a 42-minute regional outage on Sept 29. Approved $1,500 refund via Stripe Ops Portal under POL-OPS-300.', timestamp: '2026-10-02T14:20:00Z' } },
      // Live Custom Policy Template (Remote Work & Monitor Stipend)
      { id: 'PROC-REMOTE-01', labels: ['Procedure'], properties: { title: 'Remote Work & Home Office Equipment Reimbursement', steps: '1. Order monitors, keyboards, or ergonomic accessories via Navan or submit receipt. 2. Up to $300/year is auto-approved. 3. Larger workstation allowances require VP Finance (Priya Sharma) sign-off.', completion_time: 'Instant (<24 hrs)', exceptions: 'Special medical ergonomic needs approved by HR', status: 'APPROVED', effective_date: '2026-03-01', review_date: '2027-10-15' } },
      { id: 'POL-REMOTE-2026', labels: ['Policy'], properties: { title: 'Remote Work & Home Office Monitor Stipend', content: 'Employees can expense up to $300/year for home office monitors, keyboards, and ergonomic gear via Navan. Auto-approved by Priya Sharma.', status: 'APPROVED', version: '2.0', effective_date: '2026-03-01', review_date: '2027-10-15', confidence: 1.0, maxLimit: '$300/year' } },
    ],
    edges: [
      { from: 'SME-PRIYA', to: 'DEPT-FIN', type: 'REPRESENTS', properties: { role: 'SME' } },
      { from: 'SME-MARCUS', to: 'DEPT-ENG', type: 'REPRESENTS', properties: { role: 'SME' } },
      { from: 'SME-ELENA', to: 'DEPT-SEC', type: 'REPRESENTS', properties: { role: 'SME' } },
      { from: 'SME-DAVID', to: 'DEPT-HR', type: 'REPRESENTS', properties: { role: 'SME' } },
      { from: 'SME-PRIYA', to: 'DEPT-OPS', type: 'REPRESENTS', properties: { role: 'Approver' } },

      { from: 'DEPT-FIN', to: 'APP-RAMP', type: 'OWNS' },
      { from: 'DEPT-FIN', to: 'APP-NAVAN', type: 'OWNS' },
      { from: 'DEPT-SEC', to: 'APP-CROWD', type: 'OWNS' },
      { from: 'DEPT-OPS', to: 'APP-STRIPE', type: 'OWNS' },

      // Trap 1 Edges
      { from: 'DEPT-FIN', to: 'PROC-SAAS-01', type: 'RESPONSIBLE_FOR' },
      { from: 'PROC-SAAS-01', to: 'APP-RAMP', type: 'USES_APP' },
      { from: 'PROC-SAAS-01', to: 'POL-FIN-2026', type: 'GOVERNED_BY' },
      { from: 'POL-FIN-2026', to: 'DOC-FIN-2026', type: 'EVIDENCED_BY' },
      { from: 'POL-FIN-2026', to: 'SME-PRIYA', type: 'APPROVED_BY' },

      // Trap 2 Edges (Supersession)
      { from: 'DEPT-FIN', to: 'PROC-TRV-02', type: 'RESPONSIBLE_FOR' },
      { from: 'PROC-TRV-02', to: 'APP-NAVAN', type: 'USES_APP' },
      { from: 'PROC-TRV-02', to: 'POL-EXP-2026', type: 'GOVERNED_BY' },
      { from: 'PROC-TRV-02', to: 'POL-EXP-2024', type: 'GOVERNED_BY' },
      { from: 'POL-EXP-2026', to: 'POL-EXP-2024', type: 'SUPERSEDES' },
      { from: 'POL-EXP-2026', to: 'DOC-TRV-2026', type: 'EVIDENCED_BY' },
      { from: 'POL-EXP-2024', to: 'DOC-TRV-2024', type: 'EVIDENCED_BY' },
      { from: 'POL-EXP-2026', to: 'SME-PRIYA', type: 'APPROVED_BY' },

      // Trap 3 Edges (Conflict)
      { from: 'DEPT-SEC', to: 'PROC-SEC-03', type: 'RESPONSIBLE_FOR' },
      { from: 'DEPT-HR', to: 'PROC-SEC-03', type: 'RESPONSIBLE_FOR' },
      { from: 'PROC-SEC-03', to: 'APP-CROWD', type: 'USES_APP' },
      { from: 'PROC-SEC-03', to: 'POL-SEC-101', type: 'GOVERNED_BY' },
      { from: 'PROC-SEC-03', to: 'POL-HR-202', type: 'GOVERNED_BY' },
      { from: 'POL-SEC-101', to: 'POL-HR-202', type: 'CONFLICTS_WITH', properties: { reason: 'Immediate 0-hour remote wipe contradicts 7-day HR personal document retrieval grace period' } },

      // Trap 5 Edges (Decision Provenance)
      { from: 'DEPT-OPS', to: 'PROC-OPS-05', type: 'RESPONSIBLE_FOR' },
      { from: 'PROC-OPS-05', to: 'APP-STRIPE', type: 'USES_APP' },
      { from: 'PROC-OPS-05', to: 'POL-OPS-300', type: 'GOVERNED_BY' },
      { from: 'DEC-901', to: 'POL-OPS-300', type: 'BASED_ON' },
      { from: 'POL-OPS-300', to: 'DOC-SLACK-901', type: 'EVIDENCED_BY' },
      { from: 'POL-OPS-300', to: 'SME-PRIYA', type: 'APPROVED_BY' },

      // Remote Work & Monitor Stipend Edges
      { from: 'DEPT-FIN', to: 'PROC-REMOTE-01', type: 'RESPONSIBLE_FOR' },
      { from: 'PROC-REMOTE-01', to: 'APP-NAVAN', type: 'USES_APP' },
      { from: 'PROC-REMOTE-01', to: 'POL-REMOTE-2026', type: 'GOVERNED_BY' },
      { from: 'POL-REMOTE-2026', to: 'SME-PRIYA', type: 'APPROVED_BY' }
    ]
  };

  fallbackStore.tenant_globex = {
    nodes: [
      { id: 'GLX-FIN', labels: ['Department'], properties: { name: 'Finance', slug: 'finance', description: 'Globex EU treasury and Brex expense cards' } },
      { id: 'SME-HANS', labels: ['Contact'], properties: { name: 'Hans Gruber', email: 'hans@globex.io', role: 'SME', title: 'Globex CFO' } },
      { id: 'APP-BREX', labels: ['Application'], properties: { name: 'Brex', purpose: 'Globex corporate card and software spend', url: 'https://dashboard.brex.com', access_procedure: 'Azure AD SSO', sensitivity: 'HIGH' } },
      { id: 'GLX-PROC-01', labels: ['Procedure'], properties: { title: 'Software Purchase & SaaS Budget Request', steps: '1. Submit purchase order in Brex. 2. All software over €100 requires CFO (Hans Gruber) approval.', completion_time: '48 hours', exceptions: 'None', status: 'APPROVED', effective_date: '2026-01-01', review_date: '2027-01-01' } },
      { id: 'GLX-POL-2026', labels: ['Policy'], properties: { title: 'Globex Strict Spend Policy', content: 'Globex uses Brex exclusively. Auto-approval cap is €100/month. CFO Hans Gruber approves all other requests.', status: 'APPROVED', version: '1.0', effective_date: '2026-01-01', review_date: '2027-01-01', confidence: 1.0 } }
    ],
    edges: [
      { from: 'SME-HANS', to: 'GLX-FIN', type: 'REPRESENTS', properties: { role: 'SME' } },
      { from: 'GLX-FIN', to: 'APP-BREX', type: 'OWNS' },
      { from: 'GLX-FIN', to: 'GLX-PROC-01', type: 'RESPONSIBLE_FOR' },
      { from: 'GLX-PROC-01', to: 'APP-BREX', type: 'USES_APP' },
      { from: 'GLX-PROC-01', to: 'GLX-POL-2026', type: 'GOVERNED_BY' },
      { from: 'GLX-POL-2026', to: 'SME-HANS', type: 'APPROVED_BY' }
    ]
  };

  // ============================================================================
  // 2. ATTEMPT LIVE FALKORDB SEED (If FalkorDB Redis server is running)
  // ============================================================================
  try {
    const { graph: acmeGraph } = await getTenantGraph('tenant_acme');
    try {
      await acmeGraph.delete();
    } catch {
      // Graph does not exist yet on first run
    }

    const acmeSeedCypher = `
      CREATE
        (deptFin:Department {id: 'DEPT-FIN', name: 'Finance', slug: 'finance', description: 'Corporate budgets, SaaS procurement, and expense reimbursements'}),
        (deptEng:Department {id: 'DEPT-ENG', name: 'Engineering', slug: 'engineering', description: 'Cloud infrastructure, CI/CD, and AI/GPU compute clusters'}),
        (deptSec:Department {id: 'DEPT-SEC', name: 'Security', slug: 'security', description: 'Device security, VPN access, and incident response'}),
        (deptHR:Department {id: 'DEPT-HR', name: 'Human Resources', slug: 'hr', description: 'Employee onboarding, leave tracking, and offboarding'}),
        (deptOps:Department {id: 'DEPT-OPS', name: 'Operations', slug: 'operations', description: 'Customer billing exceptions and enterprise SLA management'}),

        (smePriya:Contact {id: 'SME-PRIYA', name: 'Priya Sharma', email: 'priya@acme.com', role: 'SME', title: 'VP of Finance'}),
        (smeMarcus:Contact {id: 'SME-MARCUS', name: 'Marcus Vance', email: 'marcus@acme.com', role: 'SME', title: 'Principal Infra Architect'}),
        (smeElena:Contact {id: 'SME-ELENA', name: 'Elena Rostova', email: 'elena@acme.com', role: 'SME', title: 'Head of InfoSec'}),
        (smeDavid:Contact {id: 'SME-DAVID', name: 'David Kim', email: 'david@acme.com', role: 'SME', title: 'HR Compliance Lead'}),

        (appRamp:Application {id: 'APP-RAMP', name: 'Ramp', purpose: 'Corporate cards, SaaS procurement, and expense approvals', url: 'https://app.ramp.com', access_procedure: 'SSO via Okta', sensitivity: 'HIGH'}),
        (appNavan:Application {id: 'APP-NAVAN', name: 'Navan', purpose: 'Flight and hotel travel booking', url: 'https://app.navan.com', access_procedure: 'Auto-provisioned on Day 1', sensitivity: 'MEDIUM'}),
        (appCrowd:Application {id: 'APP-CROWD', name: 'CrowdStrike Falcon', purpose: 'Endpoint security and remote laptop lock/wipe', url: 'https://falcon.crowdstrike.com', access_procedure: 'Restricted to Security Admin', sensitivity: 'CRITICAL'}),
        (appStripe:Application {id: 'APP-STRIPE', name: 'Stripe Ops Portal', purpose: 'Customer refunds and billing adjustments', url: 'https://dashboard.stripe.com', access_procedure: 'Request via Operations', sensitivity: 'HIGH'}),

        (docFin26:Document {id: 'DOC-FIN-2026', title: '2026 SaaS Procurement Handbook v3.md', source_type: 'Markdown', url: '/docs/saas-procurement-2026.md', created_at: '2026-01-15'}),
        (docTravel24:Document {id: 'DOC-TRV-2024', title: '2024 Legacy Travel Policy.pdf', source_type: 'PDF', url: '/docs/legacy-travel-2024.pdf', created_at: '2024-03-10'}),
        (docTravel26:Document {id: 'DOC-TRV-2026', title: '2026 Updated Travel & Hotel Policy.md', source_type: 'Markdown', url: '/docs/travel-policy-2026.md', created_at: '2026-02-01'}),
        (docSlackOct:Document {id: 'DOC-SLACK-901', title: 'Slack #exec-approvals Thread (Oct 2, 2026)', source_type: 'Slack', url: 'https://acme.slack.com/archives/C01/p1759401', created_at: '2026-10-02'}),

        (procSaaS:Procedure {
          id: 'PROC-SAAS-01',
          title: 'Software Purchase & SaaS Budget Request',
          steps: '1. Check duplicate tools in Ramp. 2. Submit SaaS Request Form in Ramp for amounts up to $500/mo. 3. Attach SOC2 report for new vendors. 4. Route to Priya Sharma if annual contract exceeds $5,000.',
          completion_time: '24 hours',
          exceptions: 'Emergency production tooling approved by Engineering VP',
          status: 'APPROVED',
          effective_date: '2026-01-15',
          review_date: '2027-01-15'
        }),
        (polSaaS:Policy {
          id: 'POL-FIN-2026',
          title: '2026 SaaS Procurement Governance Policy',
          content: 'All new software subscriptions must be requested through Ramp. Self-serve auto-approval applies under $500/month. Contracts above $5,000/year require VP Finance (Priya Sharma) sign-off.',
          status: 'APPROVED',
          version: '3.0',
          effective_date: '2026-01-15',
          review_date: '2027-01-15',
          confidence: 1.0
        }),

        (procHotel:Procedure {
          id: 'PROC-TRV-02',
          title: 'Employee Hotel & Travel Expense Reimbursement',
          steps: '1. Book hotel through Navan portal. 2. Nightly cap is $250/night for Tier-1 cities. 3. Upload itemized receipt within 14 days.',
          completion_time: '3 business days',
          exceptions: 'Conference headquarters hotel rate matched with manager note',
          status: 'APPROVED',
          effective_date: '2026-02-01',
          review_date: '2027-02-01'
        }),
        (polHotelOld:Policy {
          id: 'POL-EXP-2024',
          title: '2024 Hotel Reimbursement Policy (Legacy)',
          content: 'Employees may expense up to $150 per night for business hotels. Receipts must be emailed to finance@acme.com.',
          status: 'SUPERSEDED',
          version: '1.0',
          effective_date: '2024-03-10',
          review_date: '2025-03-10',
          confidence: 0.4
        }),
        (polHotelNew:Policy {
          id: 'POL-EXP-2026',
          title: '2026 Global Travel & Hotel Policy',
          content: 'Effective Feb 2026, the hotel lodging limit is $250 per night when booked via Navan. This policy formally supersedes POL-EXP-2024 ($150 cap).',
          status: 'APPROVED',
          version: '2.0',
          effective_date: '2026-02-01',
          review_date: '2027-02-01',
          confidence: 1.0
        }),

        (procWipe:Procedure {
          id: 'PROC-SEC-03',
          title: 'Remote Laptop Wipe & Contractor Offboarding',
          steps: 'Trigger endpoint lock and remote wipe via CrowdStrike Falcon upon contract termination.',
          completion_time: 'Immediate vs 7 Days (Conflicting)',
          exceptions: 'Legal hold devices',
          status: 'APPROVED',
          effective_date: '2026-04-01',
          review_date: '2026-12-31'
        }),
        (polSecWipe:Policy {
          id: 'POL-SEC-101',
          title: 'Zero-Trust Endpoint Wipe Mandate',
          content: 'Security requires immediate 0-hour remote cryptographic wipe via CrowdStrike Falcon the moment a contractor or employee offboarding ticket is filed.',
          status: 'APPROVED',
          version: '1.2',
          effective_date: '2026-04-01',
          review_date: '2026-12-31',
          confidence: 0.9
        }),
        (polHrWipe:Policy {
          id: 'POL-HR-202',
          title: 'Employee & Contractor Offboarding Grace Period Policy',
          content: 'IT and Security must wait 7 calendar days after final employment date before wiping laptops so departing staff can retrieve personal tax documents.',
          status: 'APPROVED',
          version: '1.4',
          effective_date: '2026-04-10',
          review_date: '2026-12-31',
          confidence: 0.9
        }),

        (procRefund:Procedure {
          id: 'PROC-OPS-05',
          title: 'Enterprise Customer Refund Exception Workflow',
          steps: '1. Verify SLA breach metrics. 2. Check POL-OPS-300 cap. 3. Execute refund in Stripe Ops Portal.',
          completion_time: '4 hours',
          exceptions: 'Requires VP Finance approval above $1,000',
          status: 'APPROVED',
          effective_date: '2026-05-01',
          review_date: '2027-05-01'
        }),
        (polRefund:Policy {
          id: 'POL-OPS-300',
          title: 'Enterprise SLA Credit & Refund Exception Policy',
          content: 'Cash refunds above $1,000 on annual enterprise plans are permitted if uptime drops below 99.5% and VP Finance approves in #exec-approvals.',
          status: 'APPROVED',
          version: '2.1',
          effective_date: '2026-05-01',
          review_date: '2027-05-01',
          confidence: 1.0
        }),
        (decRefund:Decision {
          id: 'DEC-901',
          title: 'Approved $1,500 Annual Refund Exception for CloudScale Inc (Ticket #TKT-4402)',
          rationale: 'Customer experienced a 42-minute regional outage on Sept 29. Approved $1,500 refund via Stripe Ops Portal under POL-OPS-300.',
          timestamp: '2026-10-02T14:20:00Z'
        }),

        (smePriya)-[:REPRESENTS {role: 'SME'}]->(deptFin),
        (smeMarcus)-[:REPRESENTS {role: 'SME'}]->(deptEng),
        (smeElena)-[:REPRESENTS {role: 'SME'}]->(deptSec),
        (smeDavid)-[:REPRESENTS {role: 'SME'}]->(deptHR),
        (smePriya)-[:REPRESENTS {role: 'Approver'}]->(deptOps),

        (deptFin)-[:OWNS]->(appRamp),
        (deptFin)-[:OWNS]->(appNavan),
        (deptSec)-[:OWNS]->(appCrowd),
        (deptOps)-[:OWNS]->(appStripe),

        (deptFin)-[:RESPONSIBLE_FOR]->(procSaaS),
        (procSaaS)-[:USES_APP]->(appRamp),
        (procSaaS)-[:GOVERNED_BY]->(polSaaS),
        (polSaaS)-[:EVIDENCED_BY]->(docFin26),
        (polSaaS)-[:APPROVED_BY]->(smePriya),

        (deptFin)-[:RESPONSIBLE_FOR]->(procHotel),
        (procHotel)-[:USES_APP]->(appNavan),
        (procHotel)-[:GOVERNED_BY]->(polHotelNew),
        (procHotel)-[:GOVERNED_BY]->(polHotelOld),
        (polHotelNew)-[:SUPERSEDES]->(polHotelOld),
        (polHotelNew)-[:EVIDENCED_BY]->(docTravel26),
        (polHotelOld)-[:EVIDENCED_BY]->(docTravel24),
        (polHotelNew)-[:APPROVED_BY]->(smePriya),

        (deptSec)-[:RESPONSIBLE_FOR]->(procWipe),
        (deptHR)-[:RESPONSIBLE_FOR]->(procWipe),
        (procWipe)-[:USES_APP]->(appCrowd),
        (procWipe)-[:GOVERNED_BY]->(polSecWipe),
        (procWipe)-[:GOVERNED_BY]->(polHrWipe),
        (polSecWipe)-[:CONFLICTS_WITH {reason: 'Immediate 0-hour remote wipe contradicts 7-day HR personal document retrieval grace period'}]->(polHrWipe),

        (deptOps)-[:RESPONSIBLE_FOR]->(procRefund),
        (procRefund)-[:USES_APP]->(appStripe),
        (procRefund)-[:GOVERNED_BY]->(polRefund),
        (decRefund)-[:BASED_ON]->(polRefund),
        (polRefund)-[:EVIDENCED_BY]->(docSlackOct),
        (polRefund)-[:APPROVED_BY]->(smePriya)
    `;

    await acmeGraph.query(acmeSeedCypher);
    acmeLiveSeeded = true;

    const { graph: globexGraph } = await getTenantGraph('tenant_globex');
    try {
      await globexGraph.delete();
    } catch {
      // Ignore if empty
    }

    const globexSeedCypher = `
      CREATE
        (deptFin:Department {id: 'GLX-FIN', name: 'Finance', slug: 'finance', description: 'Globex EU treasury and Brex expense cards'}),
        (smeHans:Contact {id: 'SME-HANS', name: 'Hans Gruber', email: 'hans@globex.io', role: 'SME', title: 'Globex CFO'}),
        (appBrex:Application {id: 'APP-BREX', name: 'Brex', purpose: 'Globex corporate card and software spend', url: 'https://dashboard.brex.com', access_procedure: 'Azure AD SSO', sensitivity: 'HIGH'}),
        (procSaaS:Procedure {
          id: 'GLX-PROC-01',
          title: 'Software Purchase & SaaS Budget Request',
          steps: '1. Submit purchase order in Brex. 2. All software over €100 requires CFO (Hans Gruber) approval.',
          completion_time: '48 hours',
          exceptions: 'None',
          status: 'APPROVED',
          effective_date: '2026-01-01',
          review_date: '2027-01-01'
        }),
        (polSaaS:Policy {
          id: 'GLX-POL-2026',
          title: 'Globex Strict Spend Policy',
          content: 'Globex uses Brex exclusively. Auto-approval cap is €100/month. CFO Hans Gruber approves all other requests.',
          status: 'APPROVED',
          version: '1.0',
          effective_date: '2026-01-01',
          review_date: '2027-01-01',
          confidence: 1.0
        }),
        (smeHans)-[:REPRESENTS {role: 'SME'}]->(deptFin),
        (deptFin)-[:OWNS]->(appBrex),
        (deptFin)-[:RESPONSIBLE_FOR]->(procSaaS),
        (procSaaS)-[:USES_APP]->(appBrex),
        (procSaaS)-[:GOVERNED_BY]->(polSaaS),
        (polSaaS)-[:APPROVED_BY]->(smeHans)
    `;

    await globexGraph.query(globexSeedCypher);
    globexLiveSeeded = true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('FalkorDB connection warning (using resilient in-memory graph store):', msg);
  }

  return {
    status: 'seeded',
    liveFalkorDB: acmeLiveSeeded && globexLiveSeeded,
    tenants: ['tenant_acme', 'tenant_globex'],
    nodeCount: {
      tenant_acme: fallbackStore.tenant_acme.nodes.length,
      tenant_globex: fallbackStore.tenant_globex.nodes.length,
    },
    edgeCount: {
      tenant_acme: fallbackStore.tenant_acme.edges.length,
      tenant_globex: fallbackStore.tenant_globex.edges.length,
    }
  };
}
