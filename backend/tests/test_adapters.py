import pytest
from backend.app.adapters.blockchain_adapter import BlockchainAdapter
from backend.app.adapters.cti_adapter import CtiAdapter
from backend.app.adapters.darkweb_adapter import DarkWebAdapter
from backend.app.adapters.pgp_adapter import PgpAdapter
from backend.app.adapters.normalized_adapter import NormalizedAdapter

def test_blockchain_adapter():
    adapter = BlockchainAdapter()
    records = adapter.load_and_normalize()
    assert len(records) > 0
    # Every tx row creates 3 evidence records (tx, sender, recipient)
    assert any(r["entity_type"] == "transaction" for r in records)
    assert any(r["entity_type"] == "wallet" for r in records)
    assert all("integrity_hash" in r and r["integrity_hash"] for r in records)

def test_cti_adapter():
    adapter = CtiAdapter()
    records = adapter.load_and_normalize()
    assert len(records) > 0
    # Must have Packrat threat actor and multiple IOC types
    assert any(r["entity_value"] == "Packrat" and r["entity_type"] == "threat_actor" for r in records)
    assert any(r["entity_type"] in ["domain", "ip", "hash"] for r in records)

def test_darkweb_adapter():
    adapter = DarkWebAdapter()
    records = adapter.load_and_normalize()
    assert len(records) > 0
    # Must protect anonymity
    assert any("Author information unavailable" in r["context"] for r in records)

def test_pgp_adapter():
    adapter = PgpAdapter()
    records = adapter.load_and_normalize()
    assert len(records) > 0
    circl_key = next((r for r in records if "CA572205C0024E06BA70BE89EAADCFFC22BD4CD5" in r["entity_value"]), None)
    assert circl_key is not None
    assert "REFERENCE" in circl_key["context"].upper()

def test_pgp_key_verification():
    valid_key = (
        "-----BEGIN PGP PUBLIC KEY BLOCK-----\n"
        "Fingerprint: CA57 2205 C002 4E06 BA70 BE89 EAAD CFFC 22BD 4CD5\n"
        "mQINBFX87/IBEADR...\n"
        "-----END PGP PUBLIC KEY BLOCK-----"
    )
    res = PgpAdapter.verify_pgp_key(valid_key)
    assert res["valid"] is True
    assert res["fingerprint"] == "CA572205C0024E06BA70BE89EAADCFFC22BD4CD5"

    invalid_key = "NOT A REAL KEY"
    res_inv = PgpAdapter.verify_pgp_key(invalid_key)
    assert res_inv["valid"] is False
