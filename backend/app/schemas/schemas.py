from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class EvidenceSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    evidence_id: str
    source: str
    entity_type: str
    entity_value: str
    context: Optional[str] = None
    provenance: Optional[str] = None
    source_ref: Optional[str] = None
    timestamp: Optional[str] = None
    confidence: float = 1.0
    integrity_hash: Optional[str] = None
    raw_data: Optional[str] = None

class EntitySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    canonical_id: str
    entity_type: str
    value: str
    display_name: Optional[str] = None
    source_count: int = 1
    risk_score: float = 0.0
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    is_synthetic: bool = False
    notes: Optional[str] = None

class RelationshipSchema(BaseModel):
    id: int
    relationship_id: str
    source_entity_id: int
    target_entity_id: int
    source_entity_val: Optional[str] = None
    source_entity_type: Optional[str] = None
    target_entity_val: Optional[str] = None
    target_entity_type: Optional[str] = None
    relationship_type: str
    confidence_score: float
    explanation: str
    evidence_ids: Optional[str] = None
    source: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EntityDetailSchema(BaseModel):
    entity: EntitySchema
    evidence: List[EvidenceSchema]
    relationships: List[RelationshipSchema]
    connected_entities: List[EntitySchema]
    timeline: List["TimelineEventSchema"]

class TimelineEventSchema(BaseModel):
    id: int
    event_id: str
    timestamp: str
    event_type: str
    title: str
    source: str
    entity_value: Optional[str] = None
    evidence_id: Optional[str] = None
    details: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class InvestigationCreate(BaseModel):
    name: str
    case_id: Optional[str] = None
    description: Optional[str] = None
    target_entity: Optional[str] = None
    analyst: Optional[str] = "Investigator Alpha"

class InvestigationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_entity: Optional[str] = None
    analyst: Optional[str] = None
    status: Optional[str] = None
    findings_json: Optional[str] = None
    analyst_notes: Optional[str] = None

class InvestigationSchema(BaseModel):
    id: int
    case_id: str
    name: str
    description: Optional[str] = None
    target_entity: Optional[str] = None
    analyst: str
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    findings_json: Optional[str] = None
    analyst_notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SearchResultItem(BaseModel):
    entity_id: int
    entity_type: str
    value: str
    display_name: Optional[str] = None
    source: str
    confidence: float
    context: Optional[str] = None
    evidence_id: Optional[str] = None
    connected_count: int = 0
    is_synthetic: bool = False

class SearchResponse(BaseModel):
    query: str
    total_matches: int
    results: List[SearchResultItem]

class DashboardStats(BaseModel):
    total_evidence: int
    total_entities: int
    total_relationships: int
    blockchain_tx_count: int
    unique_wallets_count: int
    cti_indicators_count: int
    darkweb_threads_count: int
    pgp_keys_count: int
    investigations_count: int
    high_confidence_correlations_count: int
    recent_activity: List[TimelineEventSchema]

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    value: str
    risk_score: float = 0.0
    source: Optional[str] = None
    is_synthetic: bool = False

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    confidence: float
    explanation: str
    evidence_ids: List[str] = []

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class BlockchainTxSchema(BaseModel):
    block_number: int
    timestamp: str
    transaction_hash: str
    from_address: str
    to_address: str
    value_wei: str
    value_eth: float

class BlockchainStats(BaseModel):
    total_transactions: int
    unique_wallets: int
    total_volume_eth: float
    first_block_time: Optional[str] = None
    last_block_time: Optional[str] = None
    top_wallets: List[Dict[str, Any]]

class PgpKeySchema(BaseModel):
    key_id: str
    fingerprint: str
    uid: str
    source: str
    algorithm: Optional[str] = "RSA 4096-bit"
    creation_date: Optional[str] = None
    verified: bool = True
    raw_asc: Optional[str] = None

class PgpVerifyRequest(BaseModel):
    raw_key_asc: str

class PgpVerifyResponse(BaseModel):
    fingerprint: str
    key_id: str
    uid: str
    valid: bool
    algorithm: str
    details: str

class AssistantChatRequest(BaseModel):
    query: str
    context_entity: Optional[str] = None
    case_id: Optional[str] = None

class AssistantChatResponse(BaseModel):
    answer: str
    supporting_evidence_ids: List[str]
    related_entities: List[str]
    confidence_level: str # HIGH, MEDIUM, LOW, INSUFFICIENT_EVIDENCE
    attribution_disclaimer: str

class InvestigationReportSchema(BaseModel):
    case_id: str
    title: str
    generated_at: str
    analyst: str
    primary_target: Optional[str] = None
    executive_summary: str
    observed_identifiers: List[Dict[str, Any]]
    blockchain_findings: List[Dict[str, Any]]
    cti_findings: List[Dict[str, Any]]
    darkweb_findings: List[Dict[str, Any]]
    pgp_findings: List[Dict[str, Any]]
    correlation_findings: List[Dict[str, Any]]
    supporting_evidence_ids: List[str]
    uncertainties_and_limitations: List[str]
    attribution_verdict: str
    analyst_signature: str
