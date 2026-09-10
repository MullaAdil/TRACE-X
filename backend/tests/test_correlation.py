import pytest
from backend.app.engine.scoring import ScoringEngine
from backend.app.database import SessionLocal
from backend.app.models.entities import Relationship, Entity

def test_scoring_engine():
    # Exact crypto hash should have high score
    s1 = ScoringEngine.calculate_confidence(match_type="EXACT_CRYPTO_HASH", source_count=1)
    assert s1["score"] >= 0.90
    assert "Base weight" in s1["explanation"]

    # Multi-source corroboration should increase confidence
    s2 = ScoringEngine.calculate_confidence(match_type="EXACT_DOMAIN_OR_IP", source_count=2)
    s_single = ScoringEngine.calculate_confidence(match_type="EXACT_DOMAIN_OR_IP", source_count=1)
    assert s2["score"] > s_single["score"]

    # Weak similarity should yield low score
    s3 = ScoringEngine.calculate_confidence(match_type="WEAK_SIMILARITY", source_count=1)
    assert s3["score"] <= 0.30

def test_database_relationships():
    db = SessionLocal()
    try:
        rels = db.query(Relationship).all()
        assert len(rels) > 0

        # Check types exist
        types = {r.relationship_type for r in rels}
        assert "TRANSACTS_WITH" in types or "REFERENCES" in types
        assert all(r.explanation and len(r.explanation) > 10 for r in rels)
    finally:
        db.close()
