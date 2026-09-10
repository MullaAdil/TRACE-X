export interface DashboardStats {
  total_evidence: number;
  total_entities: number;
  total_relationships: number;
  blockchain_tx_count: number;
  unique_wallets_count: number;
  cti_indicators_count: number;
  darkweb_threads_count: number;
  pgp_keys_count: number;
  investigations_count: number;
  high_confidence_correlations_count: number;
  recent_activity: TimelineEvent[];
}

export interface Investigation {
  id: number;
  case_id: string;
  name: string;
  description?: string;
  target_entity?: string;
  analyst: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  findings_json?: string;
  analyst_notes?: string;
}

export interface InvestigationCreate {
  name: string;
  case_id?: string;
  description?: string;
  target_entity?: string;
  analyst?: string;
}

export interface SearchResultItem {
  entity_id: number;
  entity_type: string;
  value: string;
  display_name?: string;
  source: string;
  confidence: number;
  context?: string;
  evidence_id?: string;
  connected_count: number;
  is_synthetic: boolean;
}

export interface SearchResponse {
  query: string;
  total_matches: number;
  results: SearchResultItem[];
}

export interface Entity {
  id: number;
  canonical_id: string;
  entity_type: string;
  value: string;
  display_name?: string;
  source_count: number;
  risk_score: number;
  first_seen?: string;
  last_seen?: string;
  is_synthetic: boolean;
  notes?: string;
}

export interface Relationship {
  id: number;
  relationship_id: string;
  source_entity_id: number;
  target_entity_id: number;
  source_entity_val?: string;
  source_entity_type?: string;
  target_entity_val?: string;
  target_entity_type?: string;
  relationship_type: string;
  confidence_score: number;
  explanation: string;
  evidence_ids?: string;
  source?: string;
}

export interface Evidence {
  id: number;
  evidence_id: string;
  source: string;
  entity_type: string;
  entity_value: string;
  context?: string;
  provenance?: string;
  source_ref?: string;
  timestamp?: string;
  confidence: number;
  integrity_hash?: string;
  raw_data?: string;
}

export interface TimelineEvent {
  id: number;
  event_id: string;
  timestamp: string;
  event_type: string;
  title: string;
  source: string;
  entity_value?: string;
  evidence_id?: string;
  details?: string;
}

export interface EntityDetail {
  entity: Entity;
  evidence: Evidence[];
  relationships: Relationship[];
  connected_entities: Entity[];
  timeline: TimelineEvent[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  value: string;
  risk_score: number;
  is_synthetic?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  confidence: number;
  explanation: string;
  evidence_ids: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface BlockchainStats {
  total_transactions: number;
  unique_wallets: number;
  total_volume_eth: number;
  first_block_time?: string;
  last_block_time?: string;
  top_wallets: { address: string; transaction_count: number }[];
}

export interface BlockchainTx {
  block_number: number;
  timestamp: string;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  value_wei: string;
  value_eth: number;
}

export interface CtiOverview {
  threat_actor: string;
  campaign: string;
  first_observed: string;
  last_observed: string;
  threat_level: string;
  source: string;
  report_reference: string;
  total_indicators: number;
  indicator_types: Record<string, number>;
  tags: { name: string; color: string }[];
  targeted_regions: string[];
  primary_tactics: string[];
}

export interface CtiIndicator {
  evidence_id: string;
  type: string;
  value: string;
  category: string;
  context: string;
  timestamp: string;
  confidence: number;
  provenance: string;
  integrity_hash: string;
}

export interface DarkWebStats {
  total_threads: number;
  corpus_name: string;
  author_status: string;
  categories: Record<string, number>;
  forums: Record<string, number>;
  top_keywords: Record<string, number>;
  extracted_target_domains_count: number;
  disclaimer: string;
}

export interface DarkWebThread {
  evidence_id: string;
  thread_id: string;
  title: string;
  category: string;
  forum_name: string;
  author: string;
  date_posted: string;
  context: string;
  provenance: string;
}

export interface PgpKey {
  key_id: string;
  fingerprint: string;
  uid: string;
  source: string;
  algorithm?: string;
  creation_date?: string;
  verified: boolean;
  raw_asc?: string;
}

export interface InvestigationReport {
  case_id: string;
  title: string;
  generated_at: string;
  analyst: string;
  primary_target?: string;
  executive_summary: string;
  observed_identifiers: { type: string; value: string; source: string; evidence_id: string }[];
  blockchain_findings: { entity: string; role: string; evidence_id: string }[];
  cti_findings: { indicator: string; type: string; provenance: string; evidence_id: string }[];
  darkweb_findings: { thread_reference: string; anonymity_status: string; evidence_id: string }[];
  pgp_findings: { fingerprint: string; role: string; evidence_id: string }[];
  correlation_findings: { relationship_id: string; type: string; confidence_score: number; explanation: string }[];
  supporting_evidence_ids: string[];
  uncertainties_and_limitations: string[];
  attribution_verdict: string;
  analyst_signature: string;
}

export interface AssistantChatResponse {
  answer: string;
  supporting_evidence_ids: string[];
  related_entities: string[];
  confidence_level: string;
  attribution_disclaimer: string;
}
