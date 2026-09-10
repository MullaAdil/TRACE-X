from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.entities import TimelineEvent
from ..schemas.schemas import TimelineEventSchema

router = APIRouter(prefix="/timeline", tags=["Timeline"])

@router.get("", response_model=List[TimelineEventSchema])
def get_unified_timeline(
    source: str = Query(None, description="Filter by source (BLOCKCHAIN, CTI, DARKWEB, PGP)"),
    entity: str = Query(None, description="Filter by entity value"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(TimelineEvent)
    if source:
        query = query.filter(TimelineEvent.source == source.upper())
    if entity:
        query = query.filter(TimelineEvent.entity_value.ilike(f"%{entity}%"))

    # Order chronologically descending
    return query.order_by(TimelineEvent.timestamp.desc(), TimelineEvent.id.desc()).limit(limit).all()
