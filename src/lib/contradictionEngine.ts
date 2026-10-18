/**
 * Contradiction & Supersession Engine (inspired by Cognee tasks/graph/detect_contradictions.py
 * and tasks/graph/resolve_temporal_contradictions.py).
 * 
 * Provides deterministic and semantic conflict detection between enterprise policies,
 * plus functional relationship supersession without deleting historical audit trails.
 */

import { FallbackTenantGraph, GraphNode, GraphEdge } from './seed';

export interface ContradictionFinding {
  conflictId: string;
  sourcePolicyId: string;
  targetPolicyId: string;
  sourceTitle: string;
  targetTitle: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  reason: string;
  detectedAt: string;
}

export interface SupersessionResult {
  supersededPolicyId: string;
  supersededTitle: string;
  newPolicyId: string;
  reason: string;
}

export interface IngestionAuditResult {
  contradictions: ContradictionFinding[];
  supersessions: SupersessionResult[];
}

// Functional relationships that are single-valued across a governance scope
const FUNCTIONAL_TOPICS = [
  'hotel',
  'lodging',
  'monitor',
  'equipment',
  'stipend',
  'software',
  'wipe',
  'offboarding',
  'remote',
  'saas',
];

/**
 * Normalizes text to tokens for semantic topic matching
 */
function extractTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
}

/**
 * Evaluates whether two policies have semantic overlap in subject matter
 */
function shareFunctionalSubject(titleA: string, contentA: string, titleB: string, contentB: string): boolean {
  const tokensA = extractTokens(`${titleA} ${contentA}`);
  const tokensB = extractTokens(`${titleB} ${contentB}`);

  // Check matching governance topics
  for (const topic of FUNCTIONAL_TOPICS) {
    if (tokensA.has(topic) && tokensB.has(topic)) {
      return true;
    }
  }

  // Check token intersection
  let shared = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) shared++;
  }
  return shared >= 3;
}

/**
 * Extracts numeric limits or dollar amounts from policy text
 */
function extractLimit(text: string): number | null {
  const match = text.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
}

/**
 * Runs automated contradiction detection on a newly ingested policy against existing graph nodes.
 * Matches Cognee detect_contradictions.py pattern.
 */
export function detectContradictionsOnIngest(
  graph: FallbackTenantGraph,
  newPolicy: GraphNode
): ContradictionFinding[] {
  const findings: ContradictionFinding[] = [];
  const newTitle = String(newPolicy.properties.title || '');
  const newContent = String(newPolicy.properties.content || '');
  const newLimit = extractLimit(`${newTitle} ${newContent}`) ?? (typeof newPolicy.properties.maxLimit === 'string' ? extractLimit(newPolicy.properties.maxLimit) : null);

  const existingPolicies = graph.nodes.filter(
    (n) => n.labels.includes('Policy') && n.id !== newPolicy.id && n.properties.status === 'APPROVED' && !n.properties.superseded
  );

  for (const existing of existingPolicies) {
    const exTitle = String(existing.properties.title || '');
    const exContent = String(existing.properties.content || '');
    const exLimit = extractLimit(`${exTitle} ${exContent}`) ?? (typeof existing.properties.maxLimit === 'string' ? extractLimit(existing.properties.maxLimit) : null);

    if (!shareFunctionalSubject(newTitle, newContent, exTitle, exContent)) {
      continue;
    }

    // 1. Numeric Limit Contradiction (e.g. $150 vs $300 on same equipment/hotel scope)
    if (newLimit !== null && exLimit !== null && newLimit !== exLimit) {
      // If it's not explicitly an amendment or newer version, it's a conflict
      const isExplicitNewer = newTitle.includes('2026') || newContent.includes('supersedes');
      if (!isExplicitNewer) {
        findings.push({
          conflictId: `CONF-${Math.floor(1000 + Math.random() * 9000)}`,
          sourcePolicyId: newPolicy.id,
          targetPolicyId: existing.id,
          sourceTitle: newTitle,
          targetTitle: exTitle,
          severity: 'CRITICAL',
          reason: `Contradictory financial caps detected: "${newTitle}" specifies $${newLimit}, whereas active policy "${exTitle}" specifies $${exLimit}.`,
          detectedAt: new Date().toISOString(),
        });
      }
    }

    // 2. Security vs Operational Rule Opposition (e.g. Immediate wipe vs Grace Period)
    const newLower = `${newTitle} ${newContent}`.toLowerCase();
    const exLower = `${exTitle} ${exContent}`.toLowerCase();

    const hasImmediateWipe = newLower.includes('0-hour') || newLower.includes('immediate wipe') || newLower.includes('instant');
    const hasGracePeriod = exLower.includes('grace period') || exLower.includes('7-day') || exLower.includes('retrieval');

    const exHasImmediateWipe = exLower.includes('0-hour') || exLower.includes('immediate wipe') || exLower.includes('instant');
    const newHasGracePeriod = newLower.includes('grace period') || newLower.includes('7-day') || newLower.includes('retrieval');

    if ((hasImmediateWipe && hasGracePeriod) || (exHasImmediateWipe && newHasGracePeriod)) {
      findings.push({
        conflictId: `CONF-${Math.floor(1000 + Math.random() * 9000)}`,
        sourcePolicyId: newPolicy.id,
        targetPolicyId: existing.id,
        sourceTitle: newTitle,
        targetTitle: exTitle,
        severity: 'CRITICAL',
        reason: `Operational deadlock: Mandated immediate cryptographic wipe directly contradicts employee personal document grace period.`,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return findings;
}

/**
 * Runs functional temporal supersession on a newly ingested policy.
 * Matches Cognee resolve_temporal_contradictions.py pattern:
 * Keeps the most recent assertion and tags older ones as superseded without deletion.
 */
export function resolveTemporalSupersessionOnIngest(
  graph: FallbackTenantGraph,
  newPolicy: GraphNode
): SupersessionResult[] {
  const results: SupersessionResult[] = [];
  const newTitle = String(newPolicy.properties.title || '');
  const newContent = String(newPolicy.properties.content || '');

  // Look for older policies on the same exact subject
  const olderCandidates = graph.nodes.filter((n) => {
    if (!n.labels.includes('Policy') || n.id === newPolicy.id) return false;
    if (n.properties.superseded) return false;

    const exTitle = String(n.properties.title || '');
    const exContent = String(n.properties.content || '');
    return shareFunctionalSubject(newTitle, newContent, exTitle, exContent);
  });

  for (const older of olderCandidates) {
    const exTitle = String(older.properties.title || '');
    const isNewerYear = (newTitle.match(/202[6-9]/) !== null) && (exTitle.match(/202[0-5]/) !== null);
    const mentionsSupersedes = newContent.toLowerCase().includes('supersede') || newContent.toLowerCase().includes('replaces');

    if (isNewerYear || mentionsSupersedes) {
      // Mark older policy node properties as superseded (preserving history)
      older.properties.superseded = true;
      older.properties.superseded_by = newPolicy.id;
      older.properties.superseded_at = new Date().toISOString();
      older.properties.supersession_reason = `Superseded by updated corporate policy "${newTitle}" (${newPolicy.id})`;

      // Add a first-class [:SUPERSEDES] edge in the property graph
      const edgeExists = graph.edges.some(
        (e) => e.from === newPolicy.id && e.to === older.id && e.type === 'SUPERSEDES'
      );
      if (!edgeExists) {
        graph.edges.push({
          from: newPolicy.id,
          to: older.id,
          type: 'SUPERSEDES',
          properties: {
            resolved_at: new Date().toISOString(),
            functional_scope: 'POLICY_VERSION',
            reason: `Automated supersession: ${newTitle} replaces ${exTitle}`,
          },
        });
      }

      results.push({
        supersededPolicyId: older.id,
        supersededTitle: exTitle,
        newPolicyId: newPolicy.id,
        reason: `Older policy "${exTitle}" superseded by newer policy "${newTitle}". Audit trail preserved.`,
      });
    }
  }

  return results;
}
