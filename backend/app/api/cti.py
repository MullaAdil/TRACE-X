import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models.entities import Evidence, Entity

router = APIRouter(prefix="/cti", tags=["CTI"])

@router.get("/overview")
def get_cti_overview(db: Session = Depends(get_db)):
    actor_ev = db.query(Evidence).filter(
        Evidence.source == "CTI",
        Evidence.entity_type == "threat_actor"
    ).first()

    raw_data = json.loads(actor_ev.raw_data or "{}") if actor_ev else {}

    # Group counts by indicator type
    all_cti = db.query(Evidence).filter(Evidence.source == "CTI").all()
    type_counts = {}
    for ev in all_cti:
        type_counts[ev.entity_type] = type_counts.get(ev.entity_type, 0) + 1

    return {
        "threat_actor": "Packrat",
        "campaign": "Seven Years of a South American Threat Actor",
        "first_observed": "2008",
        "last_observed": "2015-12-09",
        "threat_level": "2 (Medium-High)",
        "source": "CIRCL MISP OSINT (Event 5667e3ea-cec4-4a67-b7c0-f7a9950d210b)",
        "report_reference": "https://citizenlab.org/2015/12/packrat-report/",
        "total_indicators": len(all_cti),
        "indicator_types": type_counts,
        "tags": [
            {"name": "misp-galaxy:threat-actor=\"Packrat\"", "color": "#0088cc"},
            {"name": "type:OSINT", "color": "#004646"},
            {"name": "tlp:white", "color": "#ffffff"}
        ],
        "targeted_regions": ["Ecuador", "Argentina", "Venezuela", "Brazil"],
        "primary_tactics": ["Phishing", "Commercial RATs", "Trojanized Apps", "Disinformation Sites"]
    }

from sqlalchemy import or_

@router.get("/indicators")
def list_cti_indicators(
    indicator_type: str = Query(None, description="Filter by indicator type (domain, ip, hash, url)"),
    search: str = Query(None, description="Search keyword in indicator value, context, or category"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Evidence).filter(
        Evidence.source == "CTI",
        Evidence.entity_type != "threat_actor"
    )
    if indicator_type:
        query = query.filter(Evidence.entity_type == indicator_type)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Evidence.entity_value.ilike(term),
                Evidence.context.ilike(term),
                Evidence.provenance.ilike(term)
            )
        )

    results = []
    for ev in query.limit(limit).all():
        p = json.loads(ev.raw_data or "{}")
        results.append({
            "evidence_id": ev.evidence_id,
            "type": ev.entity_type,
            "value": ev.entity_value,
            "category": p.get("category", "General"),
            "context": ev.context,
            "timestamp": ev.timestamp,
            "confidence": ev.confidence,
            "provenance": ev.provenance,
            "integrity_hash": ev.integrity_hash
        })
    return results
