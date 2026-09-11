import csv
import json
from pathlib import Path
from typing import List, Dict, Any
from .base import BaseAdapter
from ..config import DATA_DIR

class NormalizedAdapter(BaseAdapter):
    def __init__(self, data_dir: Path = DATA_DIR):
        super().__init__(name="NormalizedAdapter", source_category="NORMALIZED")
        self.entities_file = data_dir / "normalized" / "entities.csv"

    def load_and_normalize(self) -> List[Dict[str, Any]]:
        evidence_records = []
        if not self.entities_file.exists():
            return evidence_records

        with open(self.entities_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader, start=1):
                src = row.get("source", "NORMALIZED").upper()
                etype = row.get("entity_type", "indicator")
                eval_ = str(row.get("entity_value", "")).strip()
                ctx = row.get("context", "")
                prov = row.get("provenance", "Normalized Master Collection")

                if not eval_:
                    continue

                raw_payload = {
                    "source": src,
                    "entity_type": etype,
                    "entity_value": eval_,
                    "context": ctx,
                    "provenance": prov
                }
                integrity_hash = self.calculate_hash(raw_payload)

                evidence_records.append({
                    "evidence_id": f"EVD-NORM-{idx:04d}",
                    "source": src if src in ["CTI", "DARKWEB", "BLOCKCHAIN", "PGP"] else "NORMALIZED",
                    "entity_type": etype,
                    "entity_value": eval_,
                    "context": ctx,
                    "provenance": prov,
                    "source_ref": "normalized/entities.csv",
                    "timestamp": "2015-12-09 12:00:00",
                    "confidence": 0.90,
                    "integrity_hash": integrity_hash,
                    "raw_data": json.dumps(raw_payload)
                })

        return evidence_records
