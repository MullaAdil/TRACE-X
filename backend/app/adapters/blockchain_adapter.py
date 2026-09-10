import csv
import json
from pathlib import Path
from typing import List, Dict, Any
from .base import BaseAdapter
from ..config import DATA_DIR

class BlockchainAdapter(BaseAdapter):
    def __init__(self, data_dir: Path = DATA_DIR):
        super().__init__(name="BlockchainAdapter", source_category="BLOCKCHAIN")
        self.file_path = data_dir / "blockchain" / "transactions.csv"
        self.block_file = data_dir / "blockchain" / "latest_block.json"

    def load_and_normalize(self) -> List[Dict[str, Any]]:
        evidence_records = []
        if not self.file_path.exists():
            return evidence_records

        with open(self.file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader, start=1):
                block_num = row.get("block_number", "")
                timestamp = row.get("timestamp", "")
                tx_hash = row.get("transaction_hash", "").lower()
                from_addr = row.get("from_address", "").lower()
                to_addr = row.get("to_address", "").lower()
                val_wei = row.get("value_wei", "0")
                
                try:
                    val_eth = float(val_wei) / 1e18
                except (ValueError, TypeError):
                    val_eth = 0.0

                raw_payload = {
                    "block_number": block_num,
                    "timestamp": timestamp,
                    "transaction_hash": tx_hash,
                    "from_address": from_addr,
                    "to_address": to_addr,
                    "value_wei": val_wei,
                    "value_eth": val_eth
                }
                integrity_hash = self.calculate_hash(raw_payload)

                # Evidence for the transaction itself
                ev_id_tx = f"EVD-BC-TX-{idx:04d}"
                evidence_records.append({
                    "evidence_id": ev_id_tx,
                    "source": "BLOCKCHAIN",
                    "entity_type": "transaction",
                    "entity_value": tx_hash,
                    "context": f"Ethereum Transfer: {from_addr[:10]}... -> {to_addr[:10]}... ({val_eth:.4f} ETH) in Block #{block_num}",
                    "provenance": f"Ethereum Mainnet Block #{block_num} / transactions.csv",
                    "source_ref": f"https://etherscan.io/tx/{tx_hash}",
                    "timestamp": timestamp,
                    "confidence": 1.0,
                    "integrity_hash": integrity_hash,
                    "raw_data": json.dumps(raw_payload)
                })

                # Evidence for sender wallet
                ev_id_from = f"EVD-BC-WAL-FROM-{idx:04d}"
                evidence_records.append({
                    "evidence_id": ev_id_from,
                    "source": "BLOCKCHAIN",
                    "entity_type": "wallet",
                    "entity_value": from_addr,
                    "context": f"Initiating wallet in Tx {tx_hash[:12]}... (Sent {val_eth:.4f} ETH)",
                    "provenance": f"Ethereum Mainnet Block #{block_num} / transactions.csv",
                    "source_ref": f"https://etherscan.io/address/{from_addr}",
                    "timestamp": timestamp,
                    "confidence": 1.0,
                    "integrity_hash": self.calculate_hash({"wallet": from_addr, "tx": tx_hash}),
                    "raw_data": json.dumps({"role": "sender", "tx_hash": tx_hash, "counterparty": to_addr, "value_eth": val_eth})
                })

                # Evidence for recipient wallet
                ev_id_to = f"EVD-BC-WAL-TO-{idx:04d}"
                evidence_records.append({
                    "evidence_id": ev_id_to,
                    "source": "BLOCKCHAIN",
                    "entity_type": "wallet",
                    "entity_value": to_addr,
                    "context": f"Recipient wallet in Tx {tx_hash[:12]}... (Received {val_eth:.4f} ETH)",
                    "provenance": f"Ethereum Mainnet Block #{block_num} / transactions.csv",
                    "source_ref": f"https://etherscan.io/address/{to_addr}",
                    "timestamp": timestamp,
                    "confidence": 1.0,
                    "integrity_hash": self.calculate_hash({"wallet": to_addr, "tx": tx_hash}),
                    "raw_data": json.dumps({"role": "recipient", "tx_hash": tx_hash, "counterparty": from_addr, "value_eth": val_eth})
                })

        return evidence_records
