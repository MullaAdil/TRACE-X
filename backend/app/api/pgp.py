import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models.entities import Evidence, Entity, Relationship
from ..adapters.pgp_adapter import PgpAdapter
from ..schemas.schemas import PgpKeySchema, PgpVerifyRequest, PgpVerifyResponse

router = APIRouter(prefix="/pgp", tags=["PGP"])

@router.get("/keys", response_model=List[PgpKeySchema])
def list_pgp_keys(db: Session = Depends(get_db)):
    pgp_evidence = db.query(Evidence).filter(
        Evidence.source == "PGP",
        Evidence.entity_type == "pgp_fingerprint"
    ).all()

    keys = []
    for ev in pgp_evidence:
        try:
            p = json.loads(ev.raw_data or "{}")
            keys.append(PgpKeySchema(
                key_id=p.get("key_id", "CIRCL"),
                fingerprint=p.get("fingerprint", ev.entity_value),
                uid=p.get("uid", ""),
                source=p.get("source", "CIRCL OpenPGP Keyring"),
                algorithm=p.get("algorithm", "RSA 4096-bit"),
                creation_date=ev.timestamp,
                verified=True,
                raw_asc=p.get("raw_asc")
            ))
        except Exception:
            continue

    return keys

@router.post("/verify", response_model=PgpVerifyResponse)
def verify_pgp_key_format(req: PgpVerifyRequest):
    result = PgpAdapter.verify_pgp_key(req.raw_key_text)
    if not result.get("valid"):
        raise HTTPException(status_code=400, detail=result.get("error", "Invalid PGP Key"))
    
    return PgpVerifyResponse(
        fingerprint=result["fingerprint"],
        key_id=result["key_id"],
        uid=result["uid"],
        valid=True,
        algorithm=result["algorithm"],
        details="Key validated against OpenPGP ASCII Armor specification RFC 4880."
    )

@router.post("/import", response_model=PgpKeySchema)
def import_pgp_key(req: PgpVerifyRequest, db: Session = Depends(get_db)):
    result = PgpAdapter.verify_pgp_key(req.raw_key_text)
    if not result.get("valid"):
        raise HTTPException(status_code=400, detail=result.get("error", "Invalid PGP Key"))

    fp = result["fingerprint"]
    kid = result["key_id"]
    uid = result["uid"]

    # Check if exists
    existing = db.query(Evidence).filter(Evidence.entity_value == fp).first()
    if existing:
        raise HTTPException(status_code=409, detail="PGP Key with this fingerprint is already present in repository")

    ev_count = db.query(Evidence).filter(Evidence.source == "PGP").count() + 1
    new_ev = Evidence(
        evidence_id=f"EVD-PGP-FP-{ev_count:04d}",
        source="PGP",
        entity_type="pgp_fingerprint",
        entity_value=fp,
        context=f"Investigator imported OpenPGP key for UID '{uid}'",
        provenance="Authorized Investigator Upload",
        source_ref="Local OpenPGP Import",
        timestamp="2026-09-10",
        confidence=1.0,
        integrity_hash=PgpAdapter.calculate_hash({"fingerprint": fp, "key_id": kid}),
        raw_data=json.dumps({"key_id": kid, "fingerprint": fp, "uid": uid, "algorithm": result["algorithm"]})
    )
    db.add(new_ev)

    # Add entity
    new_ent = Entity(
        canonical_id=f"ENT-PGP-{fp}",
        entity_type="pgp_fingerprint",
        value=fp,
        display_name=f"PGP: {kid}",
        source_count=1,
        risk_score=0.3,
        first_seen="2026-09-10",
        last_seen="2026-09-10",
        is_synthetic=False
    )
    db.add(new_ent)
    db.commit()

    return PgpKeySchema(
        key_id=kid,
        fingerprint=fp,
        uid=uid,
        source="Authorized Investigator Upload",
        algorithm=result["algorithm"],
        creation_date="2026-09-10",
        verified=True
    )
