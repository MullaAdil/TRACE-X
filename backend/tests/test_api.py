import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dashboard_stats(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_evidence"] > 0
    assert data["total_entities"] > 0
    assert data["total_relationships"] > 0

def test_unified_search(client):
    response = client.get("/api/search?q=packrat")
    assert response.status_code == 200
    data = response.json()
    assert data["total_matches"] > 0
    assert any("Packrat" in r["display_name"] for r in data["results"])

def test_blockchain_endpoints(client):
    stats = client.get("/api/blockchain/stats")
    assert stats.status_code == 200
    assert stats.json()["total_transactions"] > 0

    txs = client.get("/api/blockchain/transactions?limit=5")
    assert txs.status_code == 200
    assert len(txs.json()) > 0

    # Test invalid format returns 400 validation error
    bad_resp = client.get("/api/blockchain/live/invalid_eth_identifier")
    assert bad_resp.status_code == 400

def test_cti_overview(client):
    resp = client.get("/api/cti/overview")
    assert resp.status_code == 200
    assert resp.json()["threat_actor"] == "Packrat"

def test_darkweb_stats(client):
    resp = client.get("/api/darkweb/stats")
    assert resp.status_code == 200
    assert "anonymized" in resp.json()["author_status"]

def test_pgp_keys(client):
    resp = client.get("/api/pgp/keys")
    assert resp.status_code == 200
    assert len(resp.json()) > 0
    assert any("CA572205C0024E06BA70BE89EAADCFFC22BD4CD5" in k["fingerprint"] for k in resp.json())

def test_graph_data(client):
    resp = client.get("/api/graph/data?limit=50")
    assert resp.status_code == 200
    assert "nodes" in resp.json()
    assert "edges" in resp.json()

def test_investigation_creation_and_report(client):
    create_res = client.post("/api/investigations", json={
        "name": "Automated Test Case",
        "description": "Validation test for report generation",
        "target_entity": "Packrat",
        "analyst": "Automated Tester"
    })
    assert create_res.status_code == 200
    case_id = create_res.json()["case_id"]

    report_res = client.get(f"/api/reports/generate/{case_id}")
    assert report_res.status_code == 200
    rep = report_res.json()
    assert "INSUFFICIENT" in rep["attribution_verdict"]

def test_assistant_chat(client):
    resp = client.post("/api/assistant/chat", json={
        "query": "What evidence connects entities to Packrat?"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["supporting_evidence_ids"]) > 0
    assert "attribution_disclaimer" in data

def test_deanonymization_pipeline(client):
    targets_resp = client.get("/api/deanonymization/targets")
    assert targets_resp.status_code == 200
    targets = targets_resp.json()
    assert len(targets) >= 2
    assert any(t["id"] == "packrat" for t in targets)

    packrat_resp = client.get("/api/deanonymization/target/packrat")
    assert packrat_resp.status_code == 200
    packrat_data = packrat_resp.json()
    assert len(packrat_data["stages"]) == 5
    assert len(packrat_data["opsec_vulnerabilities"]) > 0
    assert packrat_data["overall_progress_pct"] > 70

def test_threat_enrichment(client):
    # Test known C2 IP
    resp1 = client.get("/api/enrichment/lookup?target=198.12.150.249")
    assert resp1.status_code == 200
    d1 = resp1.json()
    assert d1["type"] == "ip"
    assert d1["intel"]["threat_level"] == "CRITICAL"
    assert "flag" in d1["intel"]

    # Test Tor Exit IP
    resp2 = client.get("/api/enrichment/lookup?target=185.220.101.5")
    assert resp2.status_code == 200
    d2 = resp2.json()
    assert d2["intel"]["is_tor_exit"] is True

    # Test Subnet Co-location detection
    resp3 = client.get("/api/enrichment/lookup?target=198.12.150.10")
    assert resp3.status_code == 200
    d3 = resp3.json()
    assert d3["intel"]["has_subnet_match"] is True
    assert "198.12.150.249" in d3["intel"]["colocated_case_ips"]

def test_team_guide_endpoint(client):
    resp = client.get("/team-guide")
    assert resp.status_code == 200
    assert "TRACE-X" in resp.text
    assert "Team Guide" in resp.text

