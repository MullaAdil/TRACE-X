from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from ..database import get_db
from ..models.entities import Entity, Evidence, Relationship, TimelineEvent
from ..schemas.schemas import EntitySchema, EntityDetailSchema, EvidenceSchema, RelationshipSchema, TimelineEventSchema

router = APIRouter(prefix="/entities", tags=["Entities"])

@router.get("", response_model=List[EntitySchema])
def list_entities(
    entity_type: str = Query(None, description="Filter by entity type"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Entity)
    if entity_type:
        query = query.filter(Entity.entity_type == entity_type)
    return query.order_by(Entity.source_count.desc(), Entity.risk_score.desc()).limit(limit).all()

@router.get("/{entity_id}", response_model=EntityDetailSchema)
def get_entity_profile(entity_id: int, db: Session = Depends(get_db)):
    ent = db.query(Entity).filter(Entity.id == entity_id).first()
    if not ent:
        raise HTTPException(status_code=404, detail=f"Entity #{entity_id} not found")

    # Fetch supporting evidence
    evidence_list = db.query(Evidence).filter(
        Evidence.entity_value.ilike(ent.value)
    ).all()

    # Fetch direct relationships
    relationships = db.query(Relationship).filter(
        or_(
            Relationship.source_entity_id == ent.id,
            Relationship.target_entity_id == ent.id
        )
    ).all()

    # Collect connected entities
    connected_ids = set()
    enriched_rels = []
    for rel in relationships:
        is_source = (rel.source_entity_id == ent.id)
        other_id = rel.target_entity_id if is_source else rel.source_entity_id
        connected_ids.add(other_id)

        # Enriched relationship schema
        src_e = db.query(Entity).filter(Entity.id == rel.source_entity_id).first()
        tgt_e = db.query(Entity).filter(Entity.id == rel.target_entity_id).first()
        enriched_rels.append(RelationshipSchema(
            id=rel.id,
            relationship_id=rel.relationship_id,
            source_entity_id=rel.source_entity_id,
            target_entity_id=rel.target_entity_id,
            source_entity_val=src_e.value if src_e else "",
            source_entity_type=src_e.entity_type if src_e else "",
            target_entity_val=tgt_e.value if tgt_e else "",
            target_entity_type=tgt_e.entity_type if tgt_e else "",
            relationship_type=rel.relationship_type,
            confidence_score=rel.confidence_score,
            explanation=rel.explanation,
            evidence_ids=rel.evidence_ids,
            source=rel.source
        ))

    connected_entities = db.query(Entity).filter(Entity.id.in_(connected_ids)).all() if connected_ids else []

    # Fetch relevant timeline events
    timeline_events = db.query(TimelineEvent).filter(
        TimelineEvent.entity_value.ilike(ent.value)
    ).order_by(TimelineEvent.timestamp.desc()).limit(50).all()

    return EntityDetailSchema(
        entity=EntitySchema.model_validate(ent),
        evidence=[EvidenceSchema.model_validate(ev) for ev in evidence_list],
        relationships=enriched_rels,
        connected_entities=[EntitySchema.model_validate(ce) for ce in connected_entities],
        timeline=[TimelineEventSchema.model_validate(te) for te in timeline_events]
    )
