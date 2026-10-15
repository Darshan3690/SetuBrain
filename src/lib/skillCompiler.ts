export interface SkillCompilationInput {
  tenantName: string;
  procedureTitle: string;
  procedureId: string;
  department: string;
  application: string;
  applicationUrl: string;
  smeName: string;
  smeEmail: string;
  governingPolicy: string;
  policyVersion: string;
  effectiveDate: string;
  steps: string;
  exceptions: string;
}

/**
 * Compiles graph traversal facts into an executable SKILL.md file for autonomous agents.
 */
export function compileProcedureToSkill(input: SkillCompilationInput): string {
  const skillName = input.procedureTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return `---
name: ${skillName}
description: >
  Official corporate execution skill for ${input.procedureTitle} at ${input.tenantName}.
  Enforces ${input.governingPolicy} (v${input.policyVersion}).
license: Proprietary (${input.tenantName})
metadata:
  procedure_id: "${input.procedureId}"
  department: "${input.department}"
  primary_app: "${input.application}"
  sme_owner: "${input.smeName} <${input.smeEmail}>"
  effective_date: "${input.effectiveDate}"
---

# ${input.procedureTitle}

This skill provides verified, graph-backed instructions compiled directly from the **${input.tenantName}** corporate knowledge graph.

## Invariants & Authorizations
- **Governing Policy**: ${input.governingPolicy} (Version ${input.policyVersion})
- **Target Application**: [${input.application}](${input.applicationUrl})
- **Authorizing SME**: ${input.smeName} (\`${input.smeEmail}\`)
- **Department**: ${input.department}

## Execution Steps
${input.steps.split(/\d+\.\s+/).filter(Boolean).map((s, idx) => `${idx + 1}. **${s.trim()}**`).join('\n')}

## Exceptions & Escalation
- ${input.exceptions}
- In the event of ambiguity or transaction limits exceeding the policy, escalate directly to **${input.smeName}** (\`${input.smeEmail}\`).

## Audit Provenance
- Compiled by: **SetuBrain Compiler (FalkorDB Graph Engine)**
- Graph Provenance: \`(${input.department})-[:RESPONSIBLE_FOR]->(${input.procedureId})-[:USES_APP]->(${input.application})\`
`;
}
