from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List
from ..database import get_db
from ..models.entities import Investigation
from ..schemas.schemas import InvestigationSchema, InvestigationCreate, InvestigationUpdate

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.get("", response_model=List[InvestigationSchema])
def list_investigations(db: Session = Depends(get_db)):
    return db.query(Investigation).order_by(Investigation.id.desc()).all()

@router.post("", response_model=InvestigationSchema)
def create_investigation(inv: InvestigationCreate, db: Session = Depends(get_db)):
    case_num = db.query(Investigation).count() + 1
    case_id = inv.case_id or f"CASE-2026-{case_num:03d}"
    
    # Check if case_id exists
    existing = db.query(Investigation).filter(Investigation.case_id == case_id).first()
    if existing:
        case_id = f"CASE-2026-{case_num:03d}-{int(datetime.now().timestamp()) % 1000}"

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    db_inv = Investigation(
        case_id=case_id,
        name=inv.name,
        description=inv.description,
        target_entity=inv.target_entity,
        analyst=inv.analyst or "Lead Investigator",
        status="ACTIVE",
        created_at=now_str,
        updated_at=now_str
    )
    db.add(db_inv)
    db.commit()
    db.refresh(db_inv)
    return db_inv

@router.get("/{case_id}", response_model=InvestigationSchema)
def get_investigation(case_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.case_id == case_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation with case ID '{case_id}' not found")
    return inv

@router.patch("/{case_id}", response_model=InvestigationSchema)
def update_investigation(case_id: str, upd: InvestigationUpdate, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.case_id == case_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    if upd.name is not None:
        inv.name = upd.name
    if upd.description is not None:
        inv.description = upd.description
    if upd.target_entity is not None:
        inv.target_entity = upd.target_entity
    if upd.analyst is not None:
        inv.analyst = upd.analyst
    if upd.status is not None:
        inv.status = upd.status
    if upd.findings_json is not None:
        inv.findings_json = upd.findings_json
    if upd.analyst_notes is not None:
        inv.analyst_notes = upd.analyst_notes

    inv.updated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    db.commit()
    db.refresh(inv)
    return inv

@router.delete("/{case_id}")
def delete_investigation(case_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.case_id == case_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    db.delete(inv)
    db.commit()
    return {"message": f"Investigation {case_id} deleted successfully"}
