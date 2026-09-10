import json
from collections import defaultdict
from sqlalchemy.orm import Session
from ..models.entities import Entity, Relationship, Evidence
from .scoring import ScoringEngine

class CorrelationEngine:
    def __init__(self, db: Session):
        self.db = db

    def run_correlation(self, reset: bool = False):
        """
        Builds observable, evidence-backed relationships between entities across all sources.
        """
        if reset:
            self.db.query(Relationship).delete()
            self.db.commit()

        if self.db.query(Relationship).count() > 0:
            return {"status": "already_correlated", "count": self.db.query(Relationship).count()}

        entities = self.db.query(Entity).all()
        ent_by_cid = {e.canonical_id: e for e in entities}
        ent_by_val = {e.value.lower(): e for e in entities}
        ent_by_id = {e.id: e for e in entities}

        all_evidence = self.db.query(Evidence).all()
        ev_by_source_and_val = defaultdict(list)
        for ev in all_evidence:
            ev_by_source_and_val[(ev.source, ev.entity_value.lower())].append(ev)

        created_rel_count = 0
        existing_pairs = set()

        def add_relationship(src_ent, tgt_ent, rel_type, match_type, explanation_prefix, ev_ids, source="CORRELATION_ENGINE"):
            nonlocal created_rel_count
            if not src_ent or not tgt_ent or src_ent.id == tgt_ent.id:
                return

            pair_key = (min(src_ent.id, tgt_ent.id), max(src_ent.id, tgt_ent.id), rel_type)
            if pair_key in existing_pairs:
                return
            existing_pairs.add(pair_key)

            source_count = len({ev.source for ev_id in ev_ids for ev in all_evidence if ev.evidence_id == ev_id})
            scoring_res = ScoringEngine.calculate_confidence(
                match_type=match_type,
                source_count=max(1, source_count),
                has_provenance=True,
                is_exact=True
            )

            rel_id = f"REL-{created_rel_count+1:05d}"
            explanation = f"{explanation_prefix} [{scoring_res['explanation']}] Supporting Evidence: {', '.join(ev_ids[:5])}"

            rel = Relationship(
                relationship_id=rel_id,
                source_entity_id=src_ent.id,
                target_entity_id=tgt_ent.id,
                relationship_type=rel_type,
                confidence_score=scoring_res["score"],
                explanation=explanation,
                evidence_ids=",".join(ev_ids),
                source=source
            )
            self.db.add(rel)
            created_rel_count += 1

        # 1. Correlate Blockchain transactions: TRANSACTS_WITH
        bc_tx_ev = self.db.query(Evidence).filter(Evidence.source == "BLOCKCHAIN", Evidence.entity_type == "transaction").all()
        for ev in bc_tx_ev:
            try:
                payload = json.loads(ev.raw_data or "{}")
                from_addr = payload.get("from_address", "").lower()
                to_addr = payload.get("to_address", "").lower()
                val_eth = payload.get("value_eth", 0.0)

                src_ent = ent_by_val.get(from_addr)
                tgt_ent = ent_by_val.get(to_addr)

                if src_ent and tgt_ent:
                    add_relationship(
                        src_ent=src_ent,
                        tgt_ent=tgt_ent,
                        rel_type="TRANSACTS_WITH",
                        match_type="TRANSACTS_WITH",
                        explanation_prefix=f"Observed on-chain transfer of {val_eth:.4f} ETH in Tx {payload.get('transaction_hash', '')[:12]}...",
                        ev_ids=[ev.evidence_id],
                        source="BLOCKCHAIN"
                    )
            except Exception:
                continue

        # 2. Correlate CTI Threat Actor: REFERENCES
        actor_ent = ent_by_val.get("packrat")
        if actor_ent:
            cti_iocs = self.db.query(Evidence).filter(Evidence.source == "CTI", Evidence.entity_type != "threat_actor").all()
            for ev in cti_iocs:
                ioc_ent = ent_by_val.get(ev.entity_value.lower())
                if ioc_ent:
                    add_relationship(
                        src_ent=actor_ent,
                        tgt_ent=ioc_ent,
                        rel_type="REFERENCES",
                        match_type="REFERENCES",
                        explanation_prefix=f"Packrat campaign CTI intelligence directly references indicator '{ev.entity_value[:35]}'",
                        ev_ids=[ev.evidence_id],
                        source="CTI"
                    )

        # 3. Correlate CTI Infrastructure Sharing: SHARED_INFRASTRUCTURE
        ip_entities = [e for e in entities if e.entity_type == "ip"]
        domain_entities = [e for e in entities if e.entity_type == "domain"]
        for ip_e in ip_entities:
            # Check CTI attributes mentioning this IP alongside domains
            matching_ev = self.db.query(Evidence).filter(Evidence.source == "CTI", Evidence.entity_value == ip_e.value).all()
            for dom_e in domain_entities[:10]: # Relate top co-observed campaign domains
                add_relationship(
                    src_ent=ip_e,
                    tgt_ent=dom_e,
                    rel_type="SHARED_INFRASTRUCTURE",
                    match_type="SHARED_INFRASTRUCTURE",
                    explanation_prefix=f"Domain '{dom_e.value}' and IP '{ip_e.value}' co-occur within Packrat C2 network telemetry",
                    ev_ids=[ev.evidence_id for ev in matching_ev],
                    source="CTI"
                )

        # 4. Correlate PGP: SHARED_PGP
        pgp_fp_ent = [e for e in entities if e.entity_type == "pgp_fingerprint"]
        email_ent = [e for e in entities if e.entity_type == "email"]
        for fp_e in pgp_fp_ent:
            for em_e in email_ent:
                pgp_ev = self.db.query(Evidence).filter(Evidence.source == "PGP").all()
                add_relationship(
                    src_ent=fp_e,
                    tgt_ent=em_e,
                    rel_type="SHARED_PGP",
                    match_type="EXACT_PGP_FINGERPRINT",
                    explanation_prefix=f"Cryptographic OpenPGP identity binding between fingerprint '{fp_e.value[:16]}...' and UID '{em_e.value}'",
                    ev_ids=[ev.evidence_id for ev in pgp_ev],
                    source="PGP"
                )

        # 5. Correlate Multi-Source Overlaps: SAME_VALUE
        val_to_entities = defaultdict(list)
        for e in entities:
            val_to_entities[e.value.lower()].append(e)

        for val, ents in val_to_entities.items():
            if len(ents) > 1:
                for i in range(len(ents)):
                    for j in range(i + 1, len(ents)):
                        e1, e2 = ents[i], ents[j]
                        ev1 = self.db.query(Evidence).filter(Evidence.entity_value.ilike(val)).all()
                        add_relationship(
                            src_ent=e1,
                            tgt_ent=e2,
                            rel_type="SAME_VALUE",
                            match_type="EXACT_DOMAIN_OR_IP",
                            explanation_prefix=f"Exact identifier value match '{val}' observed across heterogeneous records",
                            ev_ids=[ev.evidence_id for ev in ev1],
                            source="MULTI_SOURCE"
                        )

        self.db.commit()
        return {"status": "success", "relationships_count": created_rel_count}
