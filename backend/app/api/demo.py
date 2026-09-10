from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
from ..database import get_db
from ..models.entities import Investigation, Evidence, Entity, Relationship, TimelineEvent
from ..schemas.schemas import InvestigationSchema

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/seed", response_model=InvestigationSchema)
def seed_demo_investigation(db: Session = Depends(get_db)):
    """
    Seeds the official SIH26151 demo scenario:
    Creates Case CASE-SIH-26151 ('Operation Packrat & Digital Footprint Attribution')
    with clearly distinguished real public OSINT and a clearly labeled
    'SYNTHETIC AUTHORIZED EVIDENCE' record.
    """
    case_id = "CASE-SIH-26151"
    existing = db.query(Investigation).filter(Investigation.case_id == case_id).first()
    if existing:
        return existing

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    # Add clearly labeled SYNTHETIC AUTHORIZED EVIDENCE record
    syn_ev_id = "EVD-SYN-AUTH-0001"
    if not db.query(Evidence).filter(Evidence.evidence_id == syn_ev_id).first():
        syn_ev = Evidence(
            evidence_id=syn_ev_id,
            source="SYNTHETIC_AUTHORIZED",
            entity_type="authorized_identity_dossier",
            entity_value="SIMULATED_PERSONA_OMEGA (FOR DEMO PURPOSE ONLY)",
            context="[SYNTHETIC AUTHORIZED EVIDENCE] Simulated judicial subpoena response showing potential correlation hypothesis. NOT a real civilian identity.",
            provenance="NTRO SIH26151 Simulated Test Harness (Clearly Labeled Synthetic)",
            source_ref="Simulated Judicial Order #SIH-2026-DEMO",
            timestamp=now_str,
            confidence=0.99,
            integrity_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            raw_data=json.dumps({"synthetic_role": "DEMO_TARGET", "disclaimer": "SYNTHETIC DEMO EVIDENCE ONLY"})
        )
        db.add(syn_ev)

        # Add synthetic entity
        syn_ent = Entity(
            canonical_id="ENT-SYNTHETIC-PERSONA-OMEGA",
            entity_type="authorized_identity_dossier",
            value="SIMULATED_PERSONA_OMEGA",
            display_name="[DEMO] Synthetic Persona Omega",
            source_count=1,
            risk_score=0.95,
            first_seen=now_str,
            last_seen=now_str,
            is_synthetic=True,
            notes="SYNTHETIC AUTHORIZED RECORD for SIH26151 Demonstration."
        )
        db.add(syn_ent)
        db.commit()

        # Connect synthetic entity to Packrat actor with clear explanation
        actor_ent = db.query(Entity).filter(Entity.value.ilike("packrat")).first()
        if actor_ent and syn_ent:
            rel = Relationship(
                relationship_id="REL-SYN-0001",
                source_entity_id=syn_ent.id,
                target_entity_id=actor_ent.id,
                relationship_type="ASSOCIATED_WITH",
                confidence_score=0.95,
                explanation="[SYNTHETIC AUTHORIZED EVIDENCE] Demonstration link between simulated Persona Omega and Packrat digital indicators via mock legal telemetry.",
                evidence_ids=syn_ev_id,
                source="SYNTHETIC_AUTHORIZED"
            )
            db.add(rel)
            db.commit()

    inv = Investigation(
        case_id=case_id,
        name="Operation Packrat: Multi-Source Threat Actor Correlation & Attribution",
        description=(
            "Investigation into the Packrat South American cyberespionage campaign, "
            "analyzing C2 hostnames, IP 198.12.150.249, payload hashes, DarkForums database leak references, "
            "and Ethereum fund flow tracking. Incorporates labeled synthetic authorized evidence for attribution demonstration."
        ),
        target_entity="Packrat / 198.12.150.249",
        analyst="NTRO SIH Lead Evaluator",
        status="ACTIVE",
        created_at=now_str,
        updated_at=now_str,
        analyst_notes="Demo scenario initialized. Trace digital correlation paths from MISP CTI to Dark Web to Blockchain."
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv
