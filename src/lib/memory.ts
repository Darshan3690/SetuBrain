import { getTenantGraph } from './falkordb';

export interface EpisodeLog {
  id: string;
  sessionId: string;
  tenantId: string;
  query: string;
  status: 'SUCCESS' | 'CONFLICT_HALTED' | 'ABSTAINED_ROUTED' | 'SUPERSEDED_FILTERED' | 'SME_PUBLISHED';
  trapType: string;
  cypherLatencyMs: number;
  timestamp: string;
  summary: string;
  persistedToFalkorDB?: boolean;
  executedCypher?: string;
}

export const episodicMemoryStore: EpisodeLog[] = [];

export function recordEpisode(log: Omit<EpisodeLog, 'id' | 'timestamp'>): EpisodeLog {
  const cypherQuery = `CREATE (e:Episode {
  id: $id,
  sessionId: $sessionId,
  tenantId: $tenantId,
  query: $query,
  status: $status,
  trapType: $trapType,
  latencyMs: $latencyMs,
  timestamp: $timestamp
}) RETURN e.id`;

  const episode: EpisodeLog = {
    ...log,
    id: `EP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    executedCypher: cypherQuery,
    persistedToFalkorDB: false,
  };

  // Keep last 50 episodes in memory
  episodicMemoryStore.unshift(episode);
  if (episodicMemoryStore.length > 50) {
    episodicMemoryStore.pop();
  }

  // Attempt async Cypher execution to Live FalkorDB
  getTenantGraph(log.tenantId)
    .then(async ({ graph, isLive }) => {
      if (isLive) {
        try {
          await graph.query(cypherQuery, {
            params: {
              id: episode.id,
              sessionId: episode.sessionId,
              tenantId: episode.tenantId,
              query: episode.query,
              status: episode.status,
              trapType: episode.trapType,
              latencyMs: episode.cypherLatencyMs,
              timestamp: episode.timestamp,
            },
          });
          episode.persistedToFalkorDB = true;
        } catch {
          episode.persistedToFalkorDB = false;
        }
      }
    })
    .catch(() => {
      episode.persistedToFalkorDB = false;
    });

  return episode;
}

export function getEpisodes(tenantId?: string): EpisodeLog[] {
  if (tenantId) {
    return episodicMemoryStore.filter(e => e.tenantId === tenantId);
  }
  return episodicMemoryStore;
}
