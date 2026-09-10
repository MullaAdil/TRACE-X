from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from ..database import get_db
from ..models.entities import Entity, Evidence, Relationship
from ..schemas.schemas import SearchResponse, SearchResultItem

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=SearchResponse)
def unified_search(
    q: str = Query(..., min_length=1, description="Search term across all datasets"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query_str = q.strip().lower()
    
    # 1. Search in Entity table
    matched_entities = db.query(Entity).filter(
        or_(
            Entity.value.ilike(f"%{query_str}%"),
            Entity.display_name.ilike(f"%{query_str}%"),
            Entity.canonical_id.ilike(f"%{query_str}%"),
            Entity.entity_type.ilike(f"%{query_str}%")
        )
    ).limit(limit).all()

    # 2. Search in Evidence table to find originating context and source
    matched_evidence = db.query(Evidence).filter(
        or_(
            Evidence.entity_value.ilike(f"%{query_str}%"),
            Evidence.context.ilike(f"%{query_str}%"),
            Evidence.evidence_id.ilike(f"%{query_str}%")
        )
    ).limit(limit).all()

    # Consolidate results
    results_dict = {}

    for ent in matched_entities:
        # Find primary evidence
        ev = db.query(Evidence).filter(Evidence.entity_value.ilike(ent.value)).first()
        # Count connected relationships
        rel_count = db.query(Relationship).filter(
            or_(Relationship.source_entity_id == ent.id, Relationship.target_entity_id == ent.id)
        ).count()

        results_dict[ent.id] = SearchResultItem(
            entity_id=ent.id,
            entity_type=ent.entity_type,
            value=ent.value,
            display_name=ent.display_name or ent.value,
            source=ev.source if ev else "CORRELATION_GRAPH",
            confidence=ev.confidence if ev else 0.85,
            context=ev.context if ev else f"Registered {ent.entity_type} entity in TRACE-X repository",
            evidence_id=ev.evidence_id if ev else None,
            connected_count=rel_count,
            is_synthetic=ent.is_synthetic
        )

    for ev in matched_evidence:
        ent = db.query(Entity).filter(Entity.value.ilike(ev.entity_value)).first()
        if ent and ent.id not in results_dict:
            rel_count = db.query(Relationship).filter(
                or_(Relationship.source_entity_id == ent.id, Relationship.target_entity_id == ent.id)
            ).count()
            results_dict[ent.id] = SearchResultItem(
                entity_id=ent.id,
                entity_type=ent.entity_type,
                value=ent.value,
                display_name=ent.display_name or ent.value,
                source=ev.source,
                confidence=ev.confidence,
                context=ev.context,
                evidence_id=ev.evidence_id,
                connected_count=rel_count,
                is_synthetic=ent.is_synthetic
            )

    results_list = list(results_dict.values())
    return SearchResponse(
        query=q,
        total_matches=len(results_list),
        results=results_list
    )
