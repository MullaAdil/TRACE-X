import hashlib
import json
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseAdapter(ABC):
    def __init__(self, name: str, source_category: str):
        self.name = name
        self.source_category = source_category

    @abstractmethod
    def load_and_normalize(self) -> List[Dict[str, Any]]:
        """
        Loads raw data and returns normalized evidence items with fields:
        evidence_id, source, entity_type, entity_value, context, provenance,
        source_ref, timestamp, confidence, integrity_hash, raw_data
        """
        pass

    @staticmethod
    def calculate_hash(data: Any) -> str:
        """Calculate SHA-256 integrity hash for an evidence payload"""
        if isinstance(data, dict):
            raw_str = json.dumps(data, sort_keys=True)
        else:
            raw_str = str(data)
        return hashlib.sha256(raw_str.encode('utf-8')).hexdigest()
