from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import Evidence, Entity, Relationship, Investigation, TimelineEvent
from ..schemas.schemas import DashboardStats, TimelineEventSchema

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_ev = db.query(Evidence).count()
    total_ent = db.query(Entity).count()
    total_rel = db.query(Relationship).count()
    
    bc_tx = db.query(Evidence).filter(Evidence.source == "BLOCKCHAIN", Evidence.entity_type == "transaction").count()
    wallets = db.query(Entity).filter(Entity.entity_type == "wallet").count()
    cti_count = db.query(Evidence).filter(Evidence.source == "CTI").count()
    dw_count = db.query(Evidence).filter(Evidence.source == "DARKWEB", Evidence.entity_type == "darkweb_thread").count()
    pgp_count = db.query(Evidence).filter(Evidence.source == "PGP", Evidence.entity_type == "pgp_fingerprint").count()
    inv_count = db.query(Investigation).count()
    high_conf_count = db.query(Relationship).filter(Relationship.confidence_score >= 0.80).count()

    recent_events = db.query(TimelineEvent).order_by(TimelineEvent.timestamp.desc(), TimelineEvent.id.desc()).limit(10).all()

    return DashboardStats(
        total_evidence=total_ev,
        total_entities=total_ent,
        total_relationships=total_rel,
        blockchain_tx_count=bc_tx,
        unique_wallets_count=wallets,
        cti_indicators_count=cti_count,
        darkweb_threads_count=dw_count,
        pgp_keys_count=pgp_count,
        investigations_count=inv_count,
        high_confidence_correlations_count=high_conf_count,
        recent_activity=[TimelineEventSchema.model_validate(e) for e in recent_events]
    )
