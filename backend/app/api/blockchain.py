import json
import re
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any
from ..database import get_db
from ..models.entities import Evidence, Entity, Relationship
from ..schemas.schemas import BlockchainStats, BlockchainTxSchema
from ..cache import cache

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])

@router.get("/stats", response_model=BlockchainStats)
def get_blockchain_overview(db: Session = Depends(get_db)):
    cached = cache.get("blockchain_stats")
    if cached:
        return cached

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

    res = BlockchainStats(
        total_transactions=len(tx_evidence),
        unique_wallets=len(wallets),
        total_volume_eth=round(total_volume_eth, 4),
        first_block_time=first_time,
        last_block_time=last_time,
        top_wallets=top_wallets
    )
    cache.set("blockchain_stats", res, ttl_seconds=60)
    return res

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

@router.get("/live/{identifier}")
async def get_live_blockchain_telemetry(identifier: str):
    """Queries live Ethereum Mainnet telemetry for any Wallet Address or Transaction Hash via Alchemy RPC."""
    import httpx
    from ..config import ALCHEMY_ETH_RPC_URL

    target = identifier.strip()
    is_address = bool(re.match(r"^0x[a-fA-F0-9]{40}$", target))
    is_tx_hash = bool(re.match(r"^0x[a-fA-F0-9]{64}$", target))

    if not is_address and not is_tx_hash:
        raise HTTPException(
            status_code=400,
            detail="Invalid Ethereum identifier format. Expected a 42-character address (0x...) or a 66-character transaction hash (0x...)"
        )

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # Case 1: Transaction Hash Query
            if is_tx_hash:
                batch_payload = [
                    {"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []},
                    {"jsonrpc": "2.0", "id": 2, "method": "eth_getTransactionByHash", "params": [target]},
                    {"jsonrpc": "2.0", "id": 3, "method": "eth_getTransactionReceipt", "params": [target]},
                ]
                resp = await client.post(ALCHEMY_ETH_RPC_URL, json=batch_payload)
                results = resp.json()
                res_map = {item["id"]: item.get("result") for item in results if isinstance(item, dict)}

                tx_data = res_map.get(2)
                if not tx_data:
                    raise HTTPException(status_code=404, detail="Transaction not found on Ethereum Mainnet")

                receipt_data = res_map.get(3) or {}
                block_num = int(res_map.get(1, "0x0"), 16)
                tx_block = int(tx_data.get("blockNumber", "0x0"), 16) if tx_data.get("blockNumber") else None
                val_wei = int(tx_data.get("value", "0x0"), 16)
                val_eth = val_wei / 1e18
                gas_used = int(receipt_data.get("gasUsed", "0x0"), 16) if receipt_data.get("gasUsed") else None
                status_code = receipt_data.get("status")
                status = "Confirmed (Success)" if status_code == "0x1" else "Failed / Reverted" if status_code == "0x0" else "Pending / Unconfirmed"

                return {
                    "type": "TRANSACTION",
                    "hash": target,
                    "network": "Ethereum Mainnet",
                    "rpc_provider": "Alchemy Enhanced Remote Procedure Call",
                    "status": status,
                    "block_number": tx_block,
                    "confirmations": max(0, block_num - tx_block) if tx_block else 0,
                    "from_address": tx_data.get("from"),
                    "to_address": tx_data.get("to"),
                    "value_eth": round(val_eth, 6),
                    "value_wei": str(val_wei),
                    "gas_used": gas_used,
                    "etherscan_url": f"https://etherscan.io/tx/{target}"
                }

            # Case 2: Address Query (Wallet or Smart Contract)
            batch_payload = [
                {"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []},
                {"jsonrpc": "2.0", "id": 2, "method": "eth_getBalance", "params": [target, "latest"]},
                {"jsonrpc": "2.0", "id": 3, "method": "eth_getTransactionCount", "params": [target, "latest"]},
                {"jsonrpc": "2.0", "id": 4, "method": "eth_getCode", "params": [target, "latest"]},
            ]
            resp = await client.post(ALCHEMY_ETH_RPC_URL, json=batch_payload)
            results = resp.json()

            res_map = {item["id"]: item.get("result") for item in results if isinstance(item, dict)}

            block_num = int(res_map.get(1, "0x0"), 16)
            bal_wei = int(res_map.get(2, "0x0"), 16)
            bal_eth = bal_wei / 1e18
            nonce = int(res_map.get(3, "0x0"), 16)
            code = res_map.get(4, "0x")
            is_contract = code is not None and code != "0x" and len(code) > 2

            # Query recent asset transfers via Alchemy Enhanced API
            transfers_payload = {
                "jsonrpc": "2.0",
                "id": 5,
                "method": "alchemy_getAssetTransfers",
                "params": [
                    {
                        "fromBlock": "0x0",
                        "toBlock": "latest",
                        "toAddress": target,
                        "category": ["external", "erc20"],
                        "maxCount": "0xa",
                        "order": "desc"
                    }
                ]
            }
            tx_resp = await client.post(ALCHEMY_ETH_RPC_URL, json=transfers_payload)
            transfers_data = tx_resp.json().get("result", {}).get("transfers", [])

            recent_txs = []
            for t in transfers_data:
                recent_txs.append({
                    "hash": t.get("hash"),
                    "from": t.get("from"),
                    "to": t.get("to"),
                    "value": t.get("value"),
                    "asset": t.get("asset", "ETH"),
                    "category": t.get("category"),
                    "timestamp": t.get("metadata", {}).get("blockTimestamp")
                })

            return {
                "type": "ADDRESS",
                "address": target,
                "network": "Ethereum Mainnet",
                "rpc_provider": "Alchemy Enhanced Remote Procedure Call",
                "is_smart_contract": is_contract,
                "account_type": "Smart Contract" if is_contract else "Externally Owned Account (EOA)",
                "live_block_height": block_num,
                "balance_eth": round(bal_eth, 6),
                "balance_wei": str(bal_wei),
                "onchain_tx_count": nonce,
                "recent_transfers": recent_txs,
                "etherscan_url": f"https://etherscan.io/address/{target}"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed querying Alchemy RPC: {str(e)}")

