import json
from sqlalchemy.orm import Session
from ..models.entities import Evidence, Entity, TimelineEvent
from ..adapters.blockchain_adapter import BlockchainAdapter
from ..adapters.cti_adapter import CtiAdapter
from ..adapters.darkweb_adapter import DarkWebAdapter
from ..adapters.pgp_adapter import PgpAdapter
from ..adapters.normalized_adapter import NormalizedAdapter
from .entity_resolution import EntityResolver

class IngestionManager:
    def __init__(self, db: Session):
        self.db = db
        self.adapters = [
            BlockchainAdapter(),
            CtiAdapter(),
            DarkWebAdapter(),
            PgpAdapter(),
            NormalizedAdapter()
        ]

    def run_ingestion(self, reset: bool = False):
        """
        Executes full ingestion pipeline across all data sources.
        Extracts normalized evidence, canonicalizes entities, and registers timeline events.
        """
        if reset:
            self.db.query(TimelineEvent).delete()
            self.db.query(Evidence).delete()
            self.db.query(Entity).delete()
            self.db.commit()

        # Check if already populated
        existing_ev_count = self.db.query(Evidence).count()
        if existing_ev_count > 0:
            return {"status": "already_populated", "evidence_count": existing_ev_count}

        all_evidence = []
        for adapter in self.adapters:
            records = adapter.load_and_normalize()
            all_evidence.extend(records)

        # Insert Evidence and aggregate Entities
        entity_map = {} # canonical_id -> dict

        for ev in all_evidence:
            ev_obj = Evidence(
                evidence_id=ev["evidence_id"],
                source=ev["source"],
                entity_type=ev["entity_type"],
                entity_value=ev["entity_value"],
                context=ev.get("context"),
                provenance=ev.get("provenance"),
                source_ref=ev.get("source_ref"),
                timestamp=ev.get("timestamp"),
                confidence=ev.get("confidence", 1.0),
                integrity_hash=ev.get("integrity_hash"),
                raw_data=ev.get("raw_data")
            )
            self.db.add(ev_obj)

            # Resolve canonical entity
            cid, norm_val = EntityResolver.normalize_value(ev["entity_type"], ev["entity_value"])
            if cid not in entity_map:
                entity_map[cid] = {
                    "canonical_id": cid,
                    "entity_type": ev["entity_type"],
                    "value": norm_val,
                    "display_name": norm_val[:50],
                    "sources": {ev["source"]},
                    "first_seen": ev.get("timestamp"),
                    "last_seen": ev.get("timestamp"),
                    "is_synthetic": False
                }
            else:
                entity_map[cid]["sources"].add(ev["source"])
                ts = ev.get("timestamp")
                if ts and (not entity_map[cid]["first_seen"] or ts < entity_map[cid]["first_seen"]):
                    entity_map[cid]["first_seen"] = ts
                if ts and (not entity_map[cid]["last_seen"] or ts > entity_map[cid]["last_seen"]):
                    entity_map[cid]["last_seen"] = ts

        self.db.commit()

        # Save unique entities
        for cid, edata in entity_map.items():
            ent_obj = Entity(
                canonical_id=cid,
                entity_type=edata["entity_type"],
                value=edata["value"],
                display_name=edata["display_name"],
                source_count=len(edata["sources"]),
                first_seen=edata["first_seen"],
                last_seen=edata["last_seen"],
                is_synthetic=edata["is_synthetic"],
                risk_score=0.9 if edata["entity_type"] in ["threat_actor", "hash"] else (0.7 if edata["entity_type"] in ["ip", "domain"] else 0.4)
            )
            self.db.add(ent_obj)

        self.db.commit()

        # Build timeline events from evidence records that have timestamps
        timeline_idx = 1
        for ev in all_evidence:
            ts = ev.get("timestamp")
            if ts and ts != "Unknown":
                evt = TimelineEvent(
                    event_id=f"EVT-TL-{timeline_idx:05d}",
                    timestamp=str(ts),
                    event_type=f"{ev['source']}_{ev['entity_type'].upper()}",
                    title=f"Observed {ev['entity_type']} in {ev['source']}: {ev['entity_value'][:35]}",
                    source=ev["source"],
                    entity_value=ev["entity_value"],
                    evidence_id=ev["evidence_id"],
                    details=ev.get("context")
                )
                self.db.add(evt)
                timeline_idx += 1

        self.db.commit()

        return {
            "status": "success",
            "evidence_count": len(all_evidence),
            "entity_count": len(entity_map),
            "timeline_events_count": timeline_idx - 1
        }
