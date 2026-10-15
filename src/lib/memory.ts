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
}

export const episodicMemoryStore: EpisodeLog[] = [];

export function recordEpisode(log: Omit<EpisodeLog, 'id' | 'timestamp'>): EpisodeLog {
  const episode: EpisodeLog = {
    ...log,
    id: `EP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };

  // Keep last 50 episodes in memory
  episodicMemoryStore.unshift(episode);
  if (episodicMemoryStore.length > 50) {
    episodicMemoryStore.pop();
  }

  return episode;
}

export function getEpisodes(tenantId?: string): EpisodeLog[] {
  if (tenantId) {
    return episodicMemoryStore.filter(e => e.tenantId === tenantId);
  }
  return episodicMemoryStore;
}
