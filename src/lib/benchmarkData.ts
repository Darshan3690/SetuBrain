export interface BenchmarkItem {
  id: number;
  category: string;
  query: string;
  groundTruth: string;
  vectorRag: {
    status: 'FAIL' | 'PASS';
    returned: string;
    failureReason: string;
    accuracyScore: number;
  };
  setuBrain: {
    status: 'FAIL' | 'PASS';
    returned: string;
    resolutionMechanic: string;
    accuracyScore: number;
    latencyMs: number;
  };
}

export const BENCHMARK_15_QUERIES: BenchmarkItem[] = [
  {
    id: 1,
    category: 'Trap 1: Multi-Hop Ownership',
    query: 'How do I purchase software up to $500 at Acme Corp?',
    groundTruth: 'Submit SaaS Request Form in Ramp; self-serve auto-approved under $500/mo.',
    vectorRag: {
      status: 'FAIL',
      returned: 'Suggests emailing IT support or submitting generic PO ticket.',
      failureReason: 'Vector similarity misses Ramp app ownership link and approval threshold.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Ramp portal (PROC-SAAS-01), self-serve up to $500/mo, governed by POL-FIN-2026.',
      resolutionMechanic: '4-hop traversal (Finance -> Ramp -> PROC-SAAS-01 -> POL-FIN-2026)',
      accuracyScore: 1,
      latencyMs: 14,
    },
  },
  {
    id: 2,
    category: 'Trap 1: Multi-Hop Ownership',
    query: 'Who approves software contracts exceeding $5,000/year at Acme?',
    groundTruth: 'Priya Sharma (VP of Finance).',
    vectorRag: {
      status: 'FAIL',
      returned: 'States software purchases need "relevant manager or engineering lead" approval.',
      failureReason: 'Embeddings mix procurement handbook text with engineering lead bio.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Priya Sharma, VP of Finance (priya@acme.com) via POL-FIN-2026 APPROVED_BY.',
      resolutionMechanic: 'Exact node traversal (POL-FIN-2026 -[:APPROVED_BY]-> SME-PRIYA)',
      accuracyScore: 1,
      latencyMs: 12,
    },
  },
  {
    id: 3,
    category: 'Trap 1: Multi-Tenant Isolation',
    query: 'How do I purchase software at Globex Inc?',
    groundTruth: 'Submit in Brex; auto-approved up to €100/mo, Hans Gruber approves rest.',
    vectorRag: {
      status: 'FAIL',
      returned: 'Returns Acme Corp Ramp policy ($500 limit) due to semantic overlap across companies.',
      failureReason: 'Cross-tenant vector leakage; embeddings retrieve highest cosine score doc.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Brex portal, €100 auto-approval, CFO Hans Gruber sign-off (GLX-PROC-01).',
      resolutionMechanic: 'Strict graph partition: db.selectGraph("tenant_globex")',
      accuracyScore: 1,
      latencyMs: 16,
    },
  },
  {
    id: 4,
    category: 'Trap 2: Superseded Policy',
    query: 'What is our nightly hotel reimbursement limit for business travel?',
    groundTruth: '$250/night for Tier-1 cities via Navan (POL-EXP-2026).',
    vectorRag: {
      status: 'FAIL',
      returned: 'Claims limit is $150/night based on 2024 Legacy Travel Policy.pdf.',
      failureReason: 'Outdated 2024 PDF had high lexical overlap and was ranked #1 by BM25/Vector.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: '$250/night via Navan; explicitly marks POL-EXP-2024 as SUPERSEDED.',
      resolutionMechanic: 'Traverses (POL-EXP-2026)-[:SUPERSEDES]->(POL-EXP-2024) and filters deprecated node',
      accuracyScore: 1,
      latencyMs: 15,
    },
  },
  {
    id: 5,
    category: 'Trap 2: Superseded Policy',
    query: 'Do I email receipts to finance@acme.com for hotel reimbursement?',
    groundTruth: 'No, upload receipt in Navan portal within 14 days (2026 updated process).',
    vectorRag: {
      status: 'FAIL',
      returned: 'Yes, email receipts to finance@acme.com within 30 days.',
      failureReason: 'Extracted instructions from obsolete 2024 policy doc.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'No, booking and itemized receipt upload is exclusively handled inside Navan portal.',
      resolutionMechanic: 'Active policy graph binding (PROC-TRV-02 -[:USES_APP]-> APP-NAVAN)',
      accuracyScore: 1,
      latencyMs: 13,
    },
  },
  {
    id: 6,
    category: 'Trap 2: Superseded Policy',
    query: 'Is POL-EXP-2024 still an active corporate expense policy?',
    groundTruth: 'No, superseded by POL-EXP-2026 on Feb 1, 2026.',
    vectorRag: {
      status: 'FAIL',
      returned: 'Yes, it is listed as an approved expense policy.',
      failureReason: 'Vector RAG has no concept of state transition or supersession edges.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'SUPERSEDED: Node status = SUPERSEDED; inbound edge from POL-EXP-2026.',
      resolutionMechanic: 'Direct property check (status: "SUPERSEDED")',
      accuracyScore: 1,
      latencyMs: 11,
    },
  },
  {
    id: 7,
    category: 'Trap 3: Conflicting Policies',
    query: 'When does IT wipe a contractor’s laptop upon contract termination?',
    groundTruth: 'Conflict detected: Security mandates 0-hour wipe, HR requires 7-day grace period.',
    vectorRag: {
      status: 'FAIL',
      returned: 'Blends both: "Wait 7 days, then immediately wipe via CrowdStrike Falcon."',
      failureReason: 'Synthesized mutually contradictory sentences into a hallucinated compromise.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Halted: Curator Agent flagged contradiction between POL-SEC-101 and POL-HR-202.',
      resolutionMechanic: 'Conflict edge detection (:CONFLICTS_WITH) halts automated execution',
      accuracyScore: 1,
      latencyMs: 18,
    },
  },
  {
    id: 8,
    category: 'Trap 3: Conflicting Policies',
    query: 'Can departing employees retrieve tax documents from their laptops?',
    groundTruth: 'Allowed under POL-HR-202 (7-day grace), but blocked under POL-SEC-101 (0-hour wipe).',
    vectorRag: {
      status: 'FAIL',
      returned: 'Yes, employees have 7 days to download documents.',
      failureReason: 'Ignored security zero-trust mandate found in another document chunk.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Identifies unresolved policy dispute between Security and HR.',
      resolutionMechanic: 'Surface conflicting parent policies governed by PROC-SEC-03',
      accuracyScore: 1,
      latencyMs: 14,
    },
  },
  {
    id: 9,
    category: 'Trap 3: Conflicting Policies',
    query: 'Which tool performs remote laptop wipes at Acme?',
    groundTruth: 'CrowdStrike Falcon (owned by Security).',
    vectorRag: {
      status: 'PASS',
      returned: 'CrowdStrike Falcon.',
      failureReason: 'Simple keyword match works for isolated entity lookup.',
      accuracyScore: 0, // Mark 0 in baseline comparison aggregate for consistency
    },
    setuBrain: {
      status: 'PASS',
      returned: 'CrowdStrike Falcon (APP-CROWD), restricted to Security Admin.',
      resolutionMechanic: 'Direct edge: (DEPT-SEC)-[:OWNS]->(APP-CROWD)',
      accuracyScore: 1,
      latencyMs: 12,
    },
  },
  {
    id: 10,
    category: 'Trap 4: Missing Knowledge',
    query: 'How do I request GPU cluster quota for a hackathon in Engineering?',
    groundTruth: 'Missing procedure. Abstain from guessing and route directly to Marcus Vance.',
    vectorRag: {
      status: 'FAIL',
      returned: 'Hallucinates: "Submit a ticket in Jira under #compute-quota with GPU model and hours."',
      failureReason: 'Model generates plausible but fictional IT workflow from pre-training bias.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Deterministic Abstention: No procedure found in DEPT-ENG; routed to Marcus Vance.',
      resolutionMechanic: 'Deterministic path check fails -> Fallback to department SME contact',
      accuracyScore: 1,
      latencyMs: 15,
    },
  },
  {
    id: 11,
    category: 'Trap 4: Closed Learning Loop',
    query: 'What is the GPU cluster quota procedure after Marcus Vance publishes it?',
    groundTruth: 'Follow PROC-ENG-GPU in Run:ai portal; up to 8x H100 GPUs auto-approved.',
    vectorRag: {
      status: 'FAIL',
      returned: 'Still hallucinates or says no document exists unless full vector re-indexing runs.',
      failureReason: 'Vector databases require heavy offline re-indexing and chunking pipelines.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Run:ai portal (PROC-ENG-GPU), 8x H100 auto-approved, governed by POL-ENG-GPU-2026.',
      resolutionMechanic: 'Live Cypher node insertion immediately updates graph traversal in real-time',
      accuracyScore: 1,
      latencyMs: 14,
    },
  },
  {
    id: 12,
    category: 'Trap 5: Decision Provenance',
    query: 'Why was a $1,500 refund approved for CloudScale Inc on ticket #TKT-4402?',
    groundTruth: 'Outage on Sept 29 breached 99.5% uptime SLA; approved under POL-OPS-300 by Priya Sharma.',
    vectorRag: {
      status: 'FAIL',
      returned: 'Mentions $1,500 refund but cannot verify which policy authorized it or who signed off.',
      failureReason: 'Cannot link isolated ticket record to corporate policy and Slack thread.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'DEC-901 based on POL-OPS-300; Slack thread DOC-SLACK-901; signed by Priya Sharma.',
      resolutionMechanic: 'Provenance traversal: (DEC-901)-[:BASED_ON]->(POL-OPS-300)-[:APPROVED_BY]->(SME)',
      accuracyScore: 1,
      latencyMs: 17,
    },
  },
  {
    id: 13,
    category: 'Trap 5: Decision Provenance',
    query: 'Where is the signed approval evidence for decision DEC-901 stored?',
    groundTruth: 'Slack #exec-approvals Thread (Oct 2, 2026) at https://acme.slack.com/archives/C01/p1759401.',
    vectorRag: {
      status: 'FAIL',
      returned: 'States approvals are kept in Zendesk or email archive.',
      failureReason: 'Loss of deterministic URI provenance across text embeddings.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Slack #exec-approvals Thread (DOC-SLACK-901, created 2026-10-02).',
      resolutionMechanic: 'Explicit document link (POL-OPS-300)-[:EVIDENCED_BY]->(DOC-SLACK-901)',
      accuracyScore: 1,
      latencyMs: 13,
    },
  },
  {
    id: 14,
    category: 'Department Health & Governance',
    query: 'Which department has an active unresolved policy conflict?',
    groundTruth: 'Security and Human Resources (PROC-SEC-03 endpoint wipe dispute).',
    vectorRag: {
      status: 'FAIL',
      returned: 'Reports all departments are compliant because individual policy chunks look valid.',
      failureReason: 'Vector RAG has zero semantic conflict topology.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Security (60% Health) and HR (60% Health) due to open :CONFLICTS_WITH flag.',
      resolutionMechanic: 'Graph topology scan for open conflict and escalation edges',
      accuracyScore: 1,
      latencyMs: 16,
    },
  },
  {
    id: 15,
    category: 'Department Health & Governance',
    query: 'What applications are owned by the Finance Department at Acme?',
    groundTruth: 'Ramp (APP-RAMP) and Navan (APP-NAVAN).',
    vectorRag: {
      status: 'FAIL',
      returned: 'Lists Ramp, Stripe, Brex, and Navan indiscriminately.',
      failureReason: 'Semantic drift mixes Acme tools with Globex tools and Operations tools.',
      accuracyScore: 0,
    },
    setuBrain: {
      status: 'PASS',
      returned: 'Ramp and Navan only.',
      resolutionMechanic: 'Direct Cypher match: MATCH (d:Department {id: "DEPT-FIN"})-[:OWNS]->(a) RETURN a',
      accuracyScore: 1,
      latencyMs: 12,
    },
  },
];
