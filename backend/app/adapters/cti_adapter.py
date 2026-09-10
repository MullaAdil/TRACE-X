import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
from .base import BaseAdapter
from ..config import DATA_DIR

class CtiAdapter(BaseAdapter):
    def __init__(self, data_dir: Path = DATA_DIR):
        super().__init__(name="CtiAdapter", source_category="CTI")
        self.packrat_file = data_dir / "cti" / "raw" / "packrat.json"
        self.manifest_file = data_dir / "cti" / "raw" / "manifest.json"

    def load_and_normalize(self) -> List[Dict[str, Any]]:
        evidence_records = []
        if not self.packrat_file.exists():
            return evidence_records

        with open(self.packrat_file, mode="r", encoding="utf-8") as f:
            data = json.load(f)

        event = data.get("Event", {})
        event_info = event.get("info", "OSINT - Packrat Campaign")
        event_date = event.get("date", "2015-12-09")
        orgc = event.get("Orgc", {}).get("name", "CIRCL")
        event_uuid = event.get("uuid", "5667e3ea-cec4-4a67-b7c0-f7a9950d210b")

        # Threat Actor entity evidence
        ev_id_actor = "EVD-CTI-ACTOR-0001"
        evidence_records.append({
            "evidence_id": ev_id_actor,
            "source": "CTI",
            "entity_type": "threat_actor",
            "entity_value": "Packrat",
            "context": f"South American cyber-espionage and disinformation threat actor tracked by CIRCL/CitizenLab. Campaign: {event_info}",
            "provenance": f"{orgc} MISP OSINT Event {event_uuid}",
            "source_ref": "https://citizenlab.org/2015/12/packrat-report/",
            "timestamp": event_date,
            "confidence": 0.95,
            "integrity_hash": self.calculate_hash({"actor": "Packrat", "uuid": event_uuid}),
            "raw_data": json.dumps({"threat_actor": "Packrat", "event_info": event_info, "tags": event.get("Tag", [])})
        })

        # Process each attribute (IOC)
        attributes = event.get("Attribute", [])
        for idx, attr in enumerate(attributes, start=1):
            attr_type = attr.get("type", "unknown")
            attr_val = str(attr.get("value", "")).strip()
            category = attr.get("category", "General")
            attr_uuid = attr.get("uuid", "")
            ts_epoch = attr.get("timestamp")
            
            ts_str = event_date
            if ts_epoch:
                try:
                    ts_str = datetime.fromtimestamp(int(ts_epoch), tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
                except Exception:
                    ts_str = event_date

            # Map MISP attribute types to normalized entity types
            norm_type = attr_type
            if attr_type == "ip-dst" or attr_type == "ip-src":
                norm_type = "ip"
            elif attr_type in ["md5", "sha1", "sha256"]:
                norm_type = "hash"
            elif attr_type in ["hostname", "domain"]:
                norm_type = "domain"
            elif attr_type == "link":
                norm_type = "url"
            elif attr_type == "comment":
                norm_type = "c2_infrastructure" if "C2" in attr_val or "infrastructure" in attr_val else "comment"

            raw_payload = {
                "category": category,
                "type": attr_type,
                "value": attr_val,
                "uuid": attr_uuid,
                "event_uuid": event_uuid,
                "to_ids": attr.get("to_ids", False)
            }
            integrity_hash = self.calculate_hash(raw_payload)

            ev_id = f"EVD-CTI-IOC-{idx:04d}"
            evidence_records.append({
                "evidence_id": ev_id,
                "source": "CTI",
                "entity_type": norm_type,
                "entity_value": attr_val,
                "context": f"MISP {category} indicator for threat actor Packrat ({attr_type})",
                "provenance": f"{orgc} MISP OSINT Event {event_uuid}",
                "source_ref": f"https://www.circl.lu/doc/misp/ {event_uuid}",
                "timestamp": ts_str,
                "confidence": 0.90 if attr.get("to_ids") else 0.80,
                "integrity_hash": integrity_hash,
                "raw_data": json.dumps(raw_payload)
            })

        return evidence_records
