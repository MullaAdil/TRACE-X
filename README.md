# TRACE-X — Threat Actor Correlation & Attribution Engine

**Smart India Hackathon (SIH) Project**  
* **Problem ID**: SIH26151  
* **Problem Title**: Dark Web Threat Actor De-anonymization  
* **Organization**: National Technical Research Organisation (NTRO)  
* **Category**: Software  

---

## 1. Executive Summary & Core Concept

**TRACE-X** is an authorized investigator-support platform that correlates fragmented digital evidence across multiple heterogeneous sources—Blockchain, CTI / MISP events, Dark Web research corpora, and OpenPGP keyrings—to progressively assess whether online identities, infrastructure, cryptocurrency activity, and digital indicators belong to the same threat-actor entity.

> **CRITICAL FORENSIC BOUNDARY PRINCIPLE**:  
> TRACE-X is **NOT** a magical tool that claims to instantly reveal the physical identity of an anonymous Tor user. It rigorously separates:
> * **Observed Evidence**: Direct cryptographic or digital observation (e.g. on-chain transfer, C2 telemetry, verified PGP signature).
> * **Inferred Relationships**: Infrastructure and co-occurrence patterns (e.g. shared IP resolving multiple phishing domains).
> * **Strong Correlations**: Multi-source corroboration with explainable confidence weights.
> * **Verified Attributions**: Asserted **only** when authorized legal identity evidence (e.g. judicial subpoenas, KYC records) is present.

---

## 2. Ingested Data Sources & Provenance

The system ingests and correlates **1,356+ real evidence records** across 4 primary domains without modifying the raw datasets:

| Domain | Source Files | Evidence Records | Description & Forensic Handling |
| :--- | :--- | :--- | :--- |
| **Blockchain** | `data/blockchain/transactions.csv`, `latest_block.json` | 260 transactions (780 records) | Real public Ethereum mainnet transactions in Block #25947413. Models wallet entities, fund flows, transaction timestamps, and unique counterparties without claiming wallets belong to private persons without legal KYC. |
| **CTI / MISP** | `data/cti/raw/packrat.json`, `manifest.json` | 155 attributes | Real CIRCL MISP OSINT event for the **Packrat** APT campaign (Ecuador, Argentina, Brazil, Venezuela). Ingests C2 domains, hostnames, IP `198.12.150.249`, URLs, and MD5/SHA256 payload hashes with MITRE TTPs. |
| **Dark Web** | `data/darkweb/raw/safe_corpus.json`, `processed/` | 201 forum threads | Privacy-safe research corpus based on DarkForums database leak threads. **Authors are masked as `[AUTHOR]` or `unknown` in the source data**. TRACE-X strictly protects this boundary and does NOT fabricate adversary identities. |
| **OpenPGP** | `data/pgp/raw/pgp_keys.csv`, `circl_public_key.asc` | Verified Keyring | Real public CIRCL key (`CA572205C0024E06BA70BE89EAADCFFC22BD4CD5`) and UID `CIRCL <info@circl.lu>`. Handled as a **verified test/reference benchmark entity**, not a threat actor. Supports ASCII armor key import. |

---

## 3. System Architecture

```
+-------------------------------------------------------------------------+
|                              DATA SOURCES                               |
|   Ethereum Blockchain   |   MISP OSINT CTI   |  Dark Web Safe Corpus    |  OpenPGP Keys
+-------------------------+--------------------+--------------------------+---------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------------------+
|                            MODULAR INGESTION ADAPTERS                                   |
|   BlockchainAdapter    |      CtiAdapter     |      DarkWebAdapter      |  PgpAdapter   |
+-----------------------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------------------+
|                     NORMALIZATION & ENTITY RESOLUTION LAYER                             |
|   Canonical ID Mapping (ENT-WALLET, ENT-DOM, ENT-IP, ENT-HASH, ENT-PGP, ENT-ACTOR)       |
|   Cryptographic SHA-256 Provenance & Chain-of-Custody Hashes                            |
+-----------------------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------------------+
|                           DETERMINISTIC CORRELATION ENGINE                              |
|   Multi-Source Relationship Discovery:                                                  |
|   * TRANSACTS_WITH (Blockchain flow)     * SHARED_INFRASTRUCTURE (C2 IPs & hostnames)  |
|   * REFERENCES (Threat Actor -> IOCs)    * SHARED_PGP (Cryptographic UID bindings)      |
|   * SAME_VALUE (Multi-source overlap)    * APPEARS_IN (Forum target leak mentions)      |
+-----------------------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------------------+
|                        EXPLAINABLE EVIDENCE SCORING ENGINE                              |
|   Confidence = BaseWeight(Match) x MultiSourceBoost(Sources) x ProvenanceFactor         |
+-----------------------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------------------+
|                          GRAPH TOPOLOGY & ANALYTICS ENGINE                              |
|   NetworkX Centrality, Shortest Paths, Neighborhood Subgraphs & JSON Serializer         |
+-----------------------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------------------+
|                             FASTAPI REST API BACKEND                                    |
|   /dashboard  /investigations  /search  /entities  /graph  /blockchain  /cti  /reports |
+-----------------------------------------------------------------------------------------+
                                       │
                                       ▼
+-----------------------------------------------------------------------------------------+
|                     REACT + TYPESCRIPT CYBER SOC INVESTIGATOR UI                        |
|   Interactive Cytoscape Graph Canvas, 360° Dossiers, AI Copilot, Guided Evaluator Demo  |
+-----------------------------------------------------------------------------------------+
```

---

## 4. Key Platform Features

1. **SOC Overview Dashboard**:
   * Telemetry counters for Evidence (1,356), Canonical Entities (1,010), Correlated Relationships (407), Ethereum Txs (260), CTI IOCs (154), and Dark Web threads (201).
   * Real-time chronological activity stream with direct evidence inspection.
2. **Investigation Case Management**:
   * Create and manage formal forensic cases with Case IDs, target entities, analyst assignments, status boards, and findings notes.
3. **Unified Cross-Source Search**:
   * One-box search for aliases, wallet addresses, hostnames, IPs, hashes, PGP fingerprints, and thread IDs across all datasets with confidence metrics.
4. **360° Entity Profile Dossier**:
   * Entity summary, risk scores, connected entities tree with forensic rationales, and complete list of supporting evidence IDs.
5. **Interactive Correlation Graph Visualizer**:
   * Cytoscape.js canvas with color-coded nodes, dynamic type filtering, zoom/pan controls, node dossiers, and clickable edges displaying *"Why are these two entities considered related?"*.
6. **Blockchain Forensic Intelligence**:
   * Ethereum mainnet block ledger inspection, wallet search, transaction direction, incoming/outgoing volume, and unique counterparty clustering.
7. **CTI MISP Intelligence**:
   * Packrat APT campaign dossier with threat levels, targeted regions (Ecuador, Argentina, Venezuela, Brazil), and filterable IOC table (domain, IP, hash, URL).
8. **Dark Web Research Corpus**:
   * Forum leak thread analysis, target domain extraction, and explicit author anonymity protection banner (`[AUTHOR]`).
9. **OpenPGP Keyring Intelligence**:
   * CIRCL reference key verification and interactive ASCII Armor public key importer with RFC 4880 format validation.
10. **Master Unified Timeline**:
    * Chronological synthesis of events spanning all four data sources with source filtering.
11. **Forensic Evidence Explorer**:
    * Full chain-of-custody registry with SHA-256 integrity hashes, collection timestamps, and provenance tracking.
12. **Forensic Investigation Report Generator**:
    * Formatted report generation with primary entity overview, observed digital identifiers, correlation findings, and official attribution verdict. Supports printable layout and Markdown export.
13. **AI Investigation Copilot**:
    * Slide-out investigative assistant strictly grounded in retrieved evidence records, returning supporting evidence IDs with each finding.
14. **Interactive Evaluator Demo Walkthrough**:
    * 10-step guided demo mode designed for SIH evaluators covering the end-to-end investigative workflow.

---

## 5. Quick Start Guide (macOS / Linux)

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### One-Click Launch
Run the included startup script from the root directory:
```bash
./run.sh
```
This automatically starts:
* **FastAPI Backend**: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)
* **React SOC Frontend**: `http://localhost:5173`

---

## 6. Verification & Automated Tests

Run the complete test suite:
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest -v
```
All 17 automated tests validate:
* Ingestion of all 260 blockchain transactions, 154 CTI indicators, 201 dark web threads, and PGP keyrings.
* Deterministic relationship discovery and explainable confidence scoring formulas.
* All FastAPI REST endpoints, search indexers, report generators, and AI assistant guardrails.

---

## 7. Responsible Attribution & SIH26151 Compliance

TRACE-X strictly adheres to the problem guidelines:
* **No Tor Attacks**: Does not exploit Tor infrastructure or conduct unauthorized access.
* **No Personal Stalking**: Does not scrape stolen PII or de-anonymize private individuals.
* **Separation of Evidence Levels**: Explicitly distinguishes observed indicators from inferences, and requires authorized legal evidence for physical person attribution.
* **Clearly Labeled Synthetic Attribution**: In the demo scenario, physical attribution is demonstrated strictly via a clearly tagged `[SYNTHETIC AUTHORIZED EVIDENCE]` record to illustrate legal workflow boundaries without fabricating real identities.
