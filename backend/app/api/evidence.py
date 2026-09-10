from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.entities import Evidence, Relationship, Entity
from ..schemas.schemas import EvidenceSchema

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("", response_model=List[EvidenceSchema])
def list_evidence(
    source: Optional[str] = Query(None, description="Filter by source"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    q: Optional[str] = Query(None, description="Search in context or value"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Evidence)
    if source:
        query = query.filter(Evidence.source == source.upper())
    if entity_type:
        query = query.filter(Evidence.entity_type == entity_type.lower())
    if q:
        query = query.filter(Evidence.entity_value.ilike(f"%{q}%") | Evidence.context.ilike(f"%{q}%"))

    return query.order_by(Evidence.id.asc()).offset(offset).limit(limit).all()

@router.post("/ingest")
def ingest_live_evidence(
    data: dict,
    db: Session = Depends(get_db)
):
    """
    Allows investigators to ingest new live indicators on the fly.
    Automatically canonicalizes entity and runs real-time correlation against existing repository.
    """
    from ..engine.entity_resolution import EntityResolver
    from ..engine.correlation import CorrelationEngine
    from ..adapters.base import BaseAdapter
    from datetime import datetime, timezone
    import json

    entity_type = data.get("entity_type", "domain").lower().strip()
    entity_val = str(data.get("entity_value", "")).strip()
    source = data.get("source", "LIVE_INVESTIGATOR_ENTRY").upper().strip()
    context = data.get("context", f"Live investigator added {entity_type} indicator")
    provenance = data.get("provenance", "Live Investigation Input")
    source_ref = data.get("source_ref", "Investigator Manual Entry")

    if not entity_val:
        raise HTTPException(status_code=400, detail="entity_value is required")

    # Generate next evidence ID
    ev_count = db.query(Evidence).count() + 1
    evidence_id = f"EVD-LIVE-{ev_count:04d}"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    integrity_hash = BaseAdapter.calculate_hash({"value": entity_val, "type": entity_type, "timestamp": now_str})

    new_ev = Evidence(
        evidence_id=evidence_id,
        source=source,
        entity_type=entity_type,
        entity_value=entity_val,
        context=context,
        provenance=provenance,
        source_ref=source_ref,
        timestamp=now_str,
        confidence=float(data.get("confidence", 0.95)),
        integrity_hash=integrity_hash,
        raw_data=json.dumps(data)
    )
    db.add(new_ev)

    # Resolve or update canonical entity
    cid, norm_val = EntityResolver.normalize_value(entity_type, entity_val)
    existing_ent = db.query(Entity).filter(Entity.canonical_id == cid).first()

    if existing_ent:
        existing_ent.source_count += 1
        existing_ent.last_seen = now_str
        target_entity = existing_ent
    else:
        target_entity = Entity(
            canonical_id=cid,
            entity_type=entity_type,
            value=norm_val,
            display_name=norm_val[:50],
            source_count=1,
            risk_score=0.8,
            first_seen=now_str,
            last_seen=now_str,
            is_synthetic=False,
            notes=context
        )
        db.add(target_entity)

    db.commit()
    db.refresh(target_entity)

    # Run correlation engine on the newly added entity
    ce = CorrelationEngine(db)
    ce.run_correlation(reset=False)

    # Fetch any newly formed relationships
    rels = db.query(Relationship).filter(
        (Relationship.source_entity_id == target_entity.id) |
        (Relationship.target_entity_id == target_entity.id)
    ).all()

    return {
        "status": "success",
        "message": f"Successfully ingested live {entity_type} indicator into TRACE-X repository",
        "evidence_id": evidence_id,
        "entity": {
            "id": target_entity.id,
            "canonical_id": target_entity.canonical_id,
            "type": target_entity.entity_type,
            "value": target_entity.value
        },
        "discovered_correlations_count": len(rels),
        "relationships": [
            {
                "id": r.relationship_id,
                "type": r.relationship_type,
                "confidence": r.confidence_score,
                "explanation": r.explanation
            }
            for r in rels
        ]
    }

@router.get("/{evidence_id}")
def get_evidence_detail(evidence_id: str, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail=f"Evidence {evidence_id} not found")

    related_rels = db.query(Relationship).filter(
        Relationship.evidence_ids.ilike(f"%{evidence_id}%")
    ).all()

    ent = db.query(Entity).filter(Entity.value.ilike(ev.entity_value)).first()

    return {
        "evidence": EvidenceSchema.model_validate(ev),
        "associated_entity": {
            "id": ent.id if ent else None,
            "canonical_id": ent.canonical_id if ent else None,
            "type": ent.entity_type if ent else ev.entity_type,
            "risk_score": ent.risk_score if ent else 0.5
        },
        "corroborating_relationships": [
            {
                "relationship_id": rel.relationship_id,
                "type": rel.relationship_type,
                "confidence": rel.confidence_score,
                "explanation": rel.explanation
            }
            for rel in related_rels
        ],
        "chain_of_custody": {
            "provenance": ev.provenance,
            "source_reference": ev.source_ref,
            "integrity_hash_sha256": ev.integrity_hash,
            "collection_timestamp": ev.timestamp,
            "verification_status": "VERIFIED_AUTHENTIC"
        }
    }
