import {
  DashboardStats,
  Investigation,
  InvestigationCreate,
  SearchResponse,
  Entity,
  EntityDetail,
  GraphData,
  BlockchainStats,
  BlockchainTx,
  CtiOverview,
  CtiIndicator,
  DarkWebStats,
  DarkWebThread,
  PgpKey,
  InvestigationReport,
  AssistantChatResponse,
  Evidence
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let errorDetail = `HTTP Error ${response.status}`;
    try {
      const err = await response.json();
      if (err.detail) errorDetail = err.detail;
    } catch {
      // Fall back to status text
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Health
  checkHealth: () => fetchJson<{ status: string; app: string }>('/health'),

  // Dashboard
  getDashboardStats: () => fetchJson<DashboardStats>('/dashboard/stats'),

  // Search
  search: (query: string, limit = 50) => 
    fetchJson<SearchResponse>(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  // Investigations
  getInvestigations: () => fetchJson<Investigation[]>('/investigations'),
  getInvestigation: (caseId: string) => fetchJson<Investigation>(`/investigations/${caseId}`),
  createInvestigation: (data: InvestigationCreate) => 
    fetchJson<Investigation>('/investigations', { method: 'POST', body: JSON.stringify(data) }),
  updateInvestigation: (caseId: string, data: Partial<Investigation>) =>
    fetchJson<Investigation>(`/investigations/${caseId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Entities
  getEntities: (entityType?: string, limit = 100) => {
    const q = entityType ? `?entity_type=${entityType}&limit=${limit}` : `?limit=${limit}`;
    return fetchJson<Entity[]>(`/entities${q}`);
  },
  getEntityProfile: (entityId: number) => fetchJson<EntityDetail>(`/entities/${entityId}`),

  // Graph
  getGraphData: (limit = 250) => fetchJson<GraphData>(`/graph/data?limit=${limit}`),
  getEntityNeighborhood: (entityId: number, radius = 1) => 
    fetchJson<GraphData>(`/graph/neighborhood/${entityId}?radius=${radius}`),
  getCorrelationPath: (sourceId: number, targetId: number) =>
    fetchJson<{ path: any[]; hops: number }>(`/graph/path?source_id=${sourceId}&target_id=${targetId}`),

  // Blockchain
  getBlockchainStats: () => fetchJson<BlockchainStats>('/blockchain/stats'),
  getTransactions: (wallet?: string, limit = 50) => {
    const q = wallet ? `?wallet=${encodeURIComponent(wallet)}&limit=${limit}` : `?limit=${limit}`;
    return fetchJson<BlockchainTx[]>(`/blockchain/transactions${q}`);
  },
  getWalletDossier: (address: string) => fetchJson<any>(`/blockchain/wallet/${address}`),

  // CTI
  getCtiOverview: () => fetchJson<CtiOverview>('/cti/overview'),
  getCtiIndicators: (type?: string, limit = 100) => {
    const q = type ? `?indicator_type=${type}&limit=${limit}` : `?limit=${limit}`;
    return fetchJson<CtiIndicator[]>(`/cti/indicators${q}`);
  },

  // Dark Web
  getDarkWebStats: () => fetchJson<DarkWebStats>('/darkweb/stats'),
  getDarkWebThreads: (category?: string, search?: string, limit = 50) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    return fetchJson<DarkWebThread[]>(`/darkweb/threads?${params.toString()}`);
  },

  // PGP
  getPgpKeys: () => fetchJson<PgpKey[]>('/pgp/keys'),
  verifyPgpKey: (rawKey: string) => 
    fetchJson<any>('/pgp/verify', { method: 'POST', body: JSON.stringify({ raw_key_text: rawKey }) }),
  importPgpKey: (rawKey: string) => 
    fetchJson<PgpKey>('/pgp/import', { method: 'POST', body: JSON.stringify({ raw_key_text: rawKey }) }),

  // Timeline
  getTimeline: (source?: string, entity?: string, limit = 100) => {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (entity) params.append('entity', entity);
    params.append('limit', limit.toString());
    return fetchJson<any[]>(`/timeline?${params.toString()}`);
  },

  // Evidence
  getEvidenceList: (source?: string, entityType?: string, q?: string, limit = 100, offset = 0) => {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (entityType) params.append('entity_type', entityType);
    if (q) params.append('q', q);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return fetchJson<Evidence[]>(`/evidence?${params.toString()}`);
  },
  getEvidenceDetail: (evidenceId: string) => fetchJson<any>(`/evidence/${evidenceId}`),

  // Live Ingestion
  ingestLiveEvidence: (data: { entity_type: string; entity_value: string; context?: string; source?: string }) =>
    fetchJson<any>('/evidence/ingest', { method: 'POST', body: JSON.stringify(data) }),

  // Live Threat Enrichment
  getEnrichment: (target: string) => 
    fetchJson<any>(`/enrichment/lookup?target=${encodeURIComponent(target)}`),

  // Reports
  generateReport: (caseId: string) => fetchJson<InvestigationReport>(`/reports/generate/${caseId}`),

  // Assistant
  askAssistant: (query: string, contextEntity?: string, caseId?: string) =>
    fetchJson<AssistantChatResponse>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ query, context_entity: contextEntity, case_id: caseId })
    }),

  // Demo Mode
  seedDemo: () => fetchJson<Investigation>('/demo/seed', { method: 'POST' }),
  reindexData: () => fetchJson<any>('/reindex', { method: 'POST' }),

  // Dark Web Threat Actor De-anonymization
  getDeanonymizationTargets: () => fetchJson<any[]>('/deanonymization/targets'),
  getDeanonymizationTarget: (targetId: string) => fetchJson<any>(`/deanonymization/target/${targetId}`),
};
