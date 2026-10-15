import { getTenantGraph } from './falkordb';

// In-memory fallback dataset for when FalkorDB container is offline
export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
  properties?: Record<string, any>;
}

export interface FallbackTenantGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const fallbackStore: Record<string, FallbackTenantGraph> = {
  tenant_acme: { nodes: [], edges: [] },
  tenant_globex: { nodes: [], edges: [] },
};

export async function seedSetuBrainGraphs() {
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
      { from: 'POL-OPS-300', to: 'SME-PRIYA', type: 'APPROVED_BY' }
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
  } catch (err: any) {
    console.warn('FalkorDB connection warning (using resilient in-memory graph store):', err.message);
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
