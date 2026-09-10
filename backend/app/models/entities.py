from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(String(64), unique=True, index=True, nullable=False)
    source = Column(String(32), index=True, nullable=False) # BLOCKCHAIN, CTI, DARKWEB, PGP, SYNTHETIC_AUTHORIZED
    entity_type = Column(String(64), index=True, nullable=False)
    entity_value = Column(String(512), index=True, nullable=False)
    context = Column(Text, nullable=True)
    provenance = Column(String(256), nullable=True)
    source_ref = Column(String(256), nullable=True)
    timestamp = Column(String(64), nullable=True)
    confidence = Column(Float, default=1.0)
    integrity_hash = Column(String(64), nullable=True) # SHA-256
    raw_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    canonical_id = Column(String(128), unique=True, index=True, nullable=False)
    entity_type = Column(String(64), index=True, nullable=False)
    value = Column(String(512), index=True, nullable=False)
    display_name = Column(String(256), nullable=True)
    source_count = Column(Integer, default=1)
    risk_score = Column(Float, default=0.0)
    first_seen = Column(String(64), nullable=True)
    last_seen = Column(String(64), nullable=True)
    is_synthetic = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    relationship_id = Column(String(64), unique=True, index=True, nullable=False)
    source_entity_id = Column(Integer, ForeignKey("entities.id"), index=True, nullable=False)
    target_entity_id = Column(Integer, ForeignKey("entities.id"), index=True, nullable=False)
    relationship_type = Column(String(64), index=True, nullable=False)
    confidence_score = Column(Float, default=0.5)
    explanation = Column(Text, nullable=False)
    evidence_ids = Column(Text, nullable=True) # JSON or comma-separated list of evidence IDs
    source = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    source_entity = relationship("Entity", foreign_keys=[source_entity_id])
    target_entity = relationship("Entity", foreign_keys=[target_entity_id])

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    target_entity = Column(String(256), nullable=True)
    analyst = Column(String(128), default="Investigator Alpha")
    status = Column(String(32), default="ACTIVE") # ACTIVE, IN_REVIEW, CLOSED, ARCHIVED
    created_at = Column(String(64), nullable=True)
    updated_at = Column(String(64), nullable=True)
    findings_json = Column(Text, nullable=True)
    analyst_notes = Column(Text, nullable=True)

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    timestamp = Column(String(64), index=True, nullable=False)
    event_type = Column(String(64), index=True, nullable=False)
    title = Column(String(256), nullable=False)
    source = Column(String(32), index=True, nullable=False)
    entity_value = Column(String(512), index=True, nullable=True)
    evidence_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
