import json
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from ..database import get_db
from ..models.entities import Evidence, Entity, Relationship
from ..schemas.schemas import BlockchainStats, BlockchainTxSchema

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])

@router.get("/stats", response_model=BlockchainStats)
def get_blockchain_overview(db: Session = Depends(get_db)):
    tx_evidence = db.query(Evidence).filter(
        Evidence.source == "BLOCKCHAIN",
        Evidence.entity_type == "transaction"
    ).all()

    wallets = db.query(Entity).filter(Entity.entity_type == "wallet").all()
    
    total_volume_eth = 0.0
    first_time = None
    last_time = None
    wallet_activity = {} # wallet -> count

    for ev in tx_evidence:
        try:
            payload = json.loads(ev.raw_data or "{}")
            val_eth = payload.get("value_eth", 0.0)
            total_volume_eth += val_eth
            ts = payload.get("timestamp")
            if ts:
                if not first_time or ts < first_time:
                    first_time = ts
                if not last_time or ts > last_time:
                    last_time = ts

            f = payload.get("from_address")
            t = payload.get("to_address")
            if f:
                wallet_activity[f] = wallet_activity.get(f, 0) + 1
            if t:
                wallet_activity[t] = wallet_activity.get(t, 0) + 1
        except Exception:
            continue

    sorted_wallets = sorted(wallet_activity.items(), key=lambda x: x[1], reverse=True)[:10]
    top_wallets = [{"address": addr, "transaction_count": count} for addr, count in sorted_wallets]

    return BlockchainStats(
        total_transactions=len(tx_evidence),
        unique_wallets=len(wallets),
        total_volume_eth=round(total_volume_eth, 4),
        first_block_time=first_time,
        last_block_time=last_time,
        top_wallets=top_wallets
    )

@router.get("/transactions", response_model=List[BlockchainTxSchema])
def list_transactions(
    wallet: str = Query(None, description="Filter by wallet address"),
    limit: int = Query(50, ge=1, le=300),
    db: Session = Depends(get_db)
):
    query = db.query(Evidence).filter(
        Evidence.source == "BLOCKCHAIN",
        Evidence.entity_type == "transaction"
    )

    transactions = []
    for ev in query.limit(limit * 2).all():
        try:
            p = json.loads(ev.raw_data or "{}")
            if wallet:
                w_lower = wallet.lower()
                if p.get("from_address", "").lower() != w_lower and p.get("to_address", "").lower() != w_lower:
                    continue

            transactions.append(BlockchainTxSchema(
                block_number=int(p.get("block_number", 0)),
                timestamp=p.get("timestamp", ""),
                transaction_hash=p.get("transaction_hash", ""),
                from_address=p.get("from_address", ""),
                to_address=p.get("to_address", ""),
                value_wei=str(p.get("value_wei", "0")),
                value_eth=float(p.get("value_eth", 0.0))
            ))
            if len(transactions) >= limit:
                break
        except Exception:
            continue

    return transactions

@router.get("/wallet/{address}")
def get_wallet_dossier(address: str, db: Session = Depends(get_db)):
    addr_lower = address.lower()
    ent = db.query(Entity).filter(Entity.value.ilike(addr_lower)).first()
    if not ent:
        raise HTTPException(status_code=404, detail=f"Wallet {address} not found in database")

    # Find all tx involving this address
    incoming_txs = []
    outgoing_txs = []
    counterparties = set()
    total_in = 0.0
    total_out = 0.0

    all_tx_ev = db.query(Evidence).filter(
        Evidence.source == "BLOCKCHAIN",
        Evidence.entity_type == "transaction"
    ).all()

    first_seen = None
    last_seen = None

    for ev in all_tx_ev:
        try:
            p = json.loads(ev.raw_data or "{}")
            f = p.get("from_address", "").lower()
            t = p.get("to_address", "").lower()
            val = float(p.get("value_eth", 0.0))
            ts = p.get("timestamp")

            if f == addr_lower:
                outgoing_txs.append(p)
                counterparties.add(t)
                total_out += val
                if ts and (not first_seen or ts < first_seen): first_seen = ts
                if ts and (not last_seen or ts > last_seen): last_seen = ts
            elif t == addr_lower:
                incoming_txs.append(p)
                counterparties.add(f)
                total_in += val
                if ts and (not first_seen or ts < first_seen): first_seen = ts
                if ts and (not last_seen or ts > last_seen): last_seen = ts
        except Exception:
            continue

    return {
        "address": addr_lower,
        "first_observed": first_seen,
        "last_observed": last_seen,
        "transaction_count": len(incoming_txs) + len(outgoing_txs),
        "incoming_count": len(incoming_txs),
        "outgoing_count": len(outgoing_txs),
        "total_received_eth": round(total_in, 4),
        "total_sent_eth": round(total_out, 4),
        "unique_counterparties_count": len(counterparties),
        "counterparties": list(counterparties)[:20],
        "incoming_transactions": incoming_txs[:20],
        "outgoing_transactions": outgoing_txs[:20],
        "attribution_warning": "No real-world person attribution should be inferred solely from public blockchain data without corroborating authorized evidence."
    }
