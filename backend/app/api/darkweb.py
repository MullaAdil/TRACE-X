import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models.entities import Evidence, Entity

router = APIRouter(prefix="/darkweb", tags=["Dark Web"])

from ..cache import cache

@router.get("/stats")
def get_darkweb_stats(db: Session = Depends(get_db)):
    cached = cache.get("darkweb_stats")
    if cached:
        return cached

    thread_ev = db.query(Evidence).filter(
        Evidence.source == "DARKWEB",
        Evidence.entity_type == "darkweb_thread"
    ).all()

    categories = {}
    forums = {}
    keywords = {
        "database": 0, "leak": 0, "sql": 0, "ssn": 0,
        "gov": 0, "combo": 0, "license": 0, "password": 0
    }

    for ev in thread_ev:
        try:
            p = json.loads(ev.raw_data or "{}")
            cat = p.get("category", "Leaks")
            fn = p.get("forum_name", "Databases")
            title = p.get("title", "").lower()

            categories[cat] = categories.get(cat, 0) + 1
            forums[fn] = forums.get(fn, 0) + 1

            for kw in keywords:
                if kw in title:
                    keywords[kw] += 1
        except Exception:
            continue

    extracted_domains = db.query(Evidence).filter(
        Evidence.source == "DARKWEB",
        Evidence.entity_type == "domain"
    ).count()

    res = {
        "total_threads": len(thread_ev),
        "corpus_name": "Zenodo DarkForums Safe Corpus (Privacy-Preserving)",
        "author_status": "Author information unavailable/anonymized in source dataset",
        "categories": categories,
        "forums": forums,
        "top_keywords": keywords,
        "extracted_target_domains_count": extracted_domains,
        "disclaimer": "CRITICAL: The underlying dataset completely anonymizes post authors ([AUTHOR] / unknown). TRACE-X models digital indicators and target leak mentions, and does not claim author identity attribution."
    }
    cache.set("darkweb_stats", res, ttl_seconds=60)
    return res

@router.get("/threads")
def list_darkweb_threads(
    category: str = Query(None, description="Filter by forum category"),
    search: str = Query(None, description="Keyword search in title"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Evidence).filter(
        Evidence.source == "DARKWEB",
        Evidence.entity_type == "darkweb_thread"
    )

    threads = []
    for ev in query.limit(limit * 2).all():
        try:
            p = json.loads(ev.raw_data or "{}")
            if category and p.get("category") != category:
                continue
            if search and search.lower() not in p.get("title", "").lower():
                continue

            threads.append({
                "evidence_id": ev.evidence_id,
                "thread_id": p.get("thread_id"),
                "title": p.get("title"),
                "category": p.get("category"),
                "forum_name": p.get("forum_name"),
                "author": "Anonymized ([AUTHOR])",
                "date_posted": p.get("date_posted"),
                "context": ev.context,
                "provenance": ev.provenance
            })
            if len(threads) >= limit:
                break
        except Exception:
            continue

    return threads
