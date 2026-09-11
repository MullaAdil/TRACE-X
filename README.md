# TRACE-X — Threat Actor Correlation & Attribution Engine

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![CI & Docker Pipeline](https://github.com/mullaadil/TRACE-X/actions/workflows/ci.yml/badge.svg)](https://github.com/mullaadil/TRACE-X/actions)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Smart India Hackathon (SIH) Project**  
* **Problem ID**: SIH26151  
* **Problem Title**: Dark Web Threat Actor De-anonymization  
* **Organization**: National Technical Research Organisation (NTRO)  
* **Category**: Software

</div>

---

## 📑 Table of Contents

- [1. Executive Summary & Forensic Boundary Principle](#1-executive-summary--forensic-boundary-principle)
- [2. Ingested Evidence Sources & Provenance](#2-ingested-evidence-sources--provenance)
- [3. System Architecture](#3-system-architecture)
- [4. Quick Start Matrix](#4-quick-start-matrix)
- [5. Windows Configuration & Setup Guide](#5-windows-configuration--setup-guide)
- [6. macOS & Linux Setup Guide](#6-macos--linux-setup-guide)
- [7. Docker Setup & Local Execution](#7-docker-setup--local-execution)
- [8. Docker in GitHub (CI/CD & GHCR Registry)](#8-docker-in-github-cicd--ghcr-registry)
- [9. AWS Free Tier Cloud Deployment](#9-aws-free-tier-cloud-deployment)
- [10. Key Platform Features (14 Core Modules)](#10-key-platform-features-14-core-modules)
- [11. REST API Reference](#11-rest-api-reference)
- [12. Verification & Automated Testing](#12-verification--automated-testing)
- [13. Responsible Attribution & SIH26151 Compliance](#13-responsible-attribution--sih26151-compliance)

---

## 1. Executive Summary & Forensic Boundary Principle

**TRACE-X** is an authorized cyber investigator-support engine designed for the **National Technical Research Organisation (NTRO)**. It ingests and correlates fragmented digital evidence across four heterogeneous data sources—**Ethereum Blockchain**, **CTI / MISP OSINT events**, **Dark Web research corpora**, and **OpenPGP keyrings**—to progressively establish probabilistic and deterministic linkages across threat-actor entities.

```
                    ┌─────────────────────────────────────────────────────────┐
                    │            TRACE-X EVIDENCE SEPARATION ENGINE           │
                    └─────────────────────────────────────────────────────────┘
                                                │
         ┌──────────────────┬───────────────────┴───────────────────┬──────────────────┐
         ▼                  ▼                                       ▼                  ▼
  [Observed Data]    [Inferred Links]                        [Correlations]     [Attributions]
Direct cryptographic Infrastructure reuse                   Multi-source boost  Legal identity KYC
  observations        & co-occurrence                        scoring matrix       subpoena records
```

> [!IMPORTANT]
> **CRITICAL FORENSIC BOUNDARY PRINCIPLE**:  
> TRACE-X is **NOT** a speculative deanonymization tool that claims to magically deanonymize Tor network sessions. In accordance with digital forensics standards (ISO/IEC 27037) and Indian IT Act admissibility requirements, it rigorously separates:
> * **Observed Evidence**: Direct cryptographic or digital telemetry (e.g., on-chain transfer, C2 resolution, verified PGP signature).
> * **Inferred Relationships**: Infrastructure co-occurrence patterns (e.g., shared IP hosting multiple malware drop domains).
> * **Strong Correlations**: Multi-source corroboration with explainable confidence weights.
> * **Verified Attributions**: Asserted **only** when authorized legal identity evidence (e.g., judicial subpoenas, KYC records) is attached.

---

## 2. Ingested Evidence Sources & Provenance

The system ingests and correlates **1,356+ real evidence records** across 4 primary domains without modifying raw artifacts:

| Domain | Source Files | Ingested Records | Description & Forensic Handling |
| :--- | :--- | :--- | :--- |
| **Blockchain** | `data/blockchain/transactions.csv`<br>`data/blockchain/latest_block.json` | 260 transactions<br>(780 entity records) | Real public Ethereum mainnet transactions from Block #25947413 + live on-chain Alchemy RPC lookups. Models wallet entities, fund flows, transaction timestamps, and counterparty clusters without assuming private identity without KYC. |
| **CTI / MISP** | `data/cti/raw/packrat.json`<br>`manifest.json` | 155 attributes | Real CIRCL MISP OSINT event for the **Packrat** APT campaign (Ecuador, Argentina, Brazil, Venezuela). Ingests C2 domains, hostnames, IP `198.12.150.249`, URLs, and MD5/SHA256 payload hashes with MITRE TTP mappings. |
| **Dark Web** | `data/darkweb/raw/safe_corpus.json`<br>`data/darkweb/processed/` | 201 forum threads | Privacy-safe research corpus based on forum database leak threads. **Author handles are masked as `[AUTHOR]` or `unknown` in source data**. TRACE-X strictly protects this boundary and does NOT fabricate adversary identities. |
| **OpenPGP** | `data/pgp/raw/pgp_keys.csv`<br>`circl_public_key.asc` | Verified Keyring | Real public CIRCL key (`CA572205C0024E06BA70BE89EAADCFFC22BD4CD5`) with UID `CIRCL <info@circl.lu>`. Treated as a **verified reference benchmark entity**. Supports interactive RFC 4880 ASCII armor key import. |

---

## 3. System Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    DATA INGESTION LAYER                                 |
|   Ethereum Blockchain   |      MISP OSINT CTI    |   Dark Web Safe Corpus  |  OpenPGP   |
+-------------------------+------------------------+-------------------------+------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                MODULAR INGESTION ADAPTERS                               |
|     BlockchainAdapter   |       CtiAdapter       |      DarkWebAdapter     | PgpAdapter |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                          CANONICAL ENTITY & PROVENANCE ENGINE                           |
|   Canonical ID Formats: ENT-WALLET | ENT-DOM | ENT-IP | ENT-HASH | ENT-PGP | ENT-ACTOR  |
|   Integrity Assurance: SHA-256 Hashes, Collection Timestamps, Chain-of-Custody Logs     |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                            DETERMINISTIC CORRELATION ENGINE                             |
|   Multi-Source Relationship Discovery:                                                  |
|   * TRANSACTS_WITH (On-chain fund flow)   * SHARED_INFRASTRUCTURE (C2 IPs & hostnames) |
|   * REFERENCES (Threat Actor -> IOCs)     * SHARED_PGP (Cryptographic UID bindings)     |
|   * SAME_VALUE (Multi-source overlap)     * APPEARS_IN (Dark web forum leak mentions)  |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                          EXPLAINABLE EVIDENCE SCORING ENGINE                            |
|        Confidence Score = BaseWeight(Match) x MultiSourceBoost x ProvenanceFactor       |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                               FASTAPI ASYNCHRONOUS BACKEND                              |
|   Endpoints: /api/dashboard /api/investigations /api/search /api/graph /api/blockchain |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                              REACT + TYPESCRIPT SOC FRONTEND                            |
|   Interactive Cytoscape Canvas, 360° Dossiers, AI Copilot, Guided Evaluator Walkthrough |
+-----------------------------------------------------------------------------------------+
```

---

## 4. Quick Start Matrix

Choose your operating system or preferred deployment environment:

| Environment | Method | Command / Action | Access Point |
| :--- | :--- | :--- | :--- |
| **Windows** | 1-Click Batch | Double-click `run.bat` | `http://localhost:5173` |
| **Windows** | PowerShell | `powershell -ExecutionPolicy Bypass -File run.ps1` | `http://localhost:5173` |
| **macOS / Linux** | 1-Click Shell | `./run.sh` | `http://localhost:5173` |
| **Docker (Local)** | Docker Compose | `docker compose up --build` | `http://localhost:80` |
| **GitHub Actions** | Automated CI | Push to `main` (auto tests & container build) | [Actions Tab](../../actions) |
| **AWS Cloud** | EC2 Free Tier | `bash deploy_aws_ec2.sh` | `http://<EC2_PUBLIC_IP>` |

---

## 5. Windows Configuration & Setup Guide

TRACE-X includes native Windows support with automated setup scripts and manual Command Prompt / PowerShell options.

### System Requirements (Windows)
* **Windows 10 / 11** (64-bit)
* **Python 3.10+**: Download from [python.org](https://www.python.org/downloads/).  
  *(⚠️ Check the box **"Add python.exe to PATH"** during installation!)*
* **Node.js 18+ (LTS)**: Download from [nodejs.org](https://nodejs.org/).
* **Git for Windows**: Download from [git-scm.com](https://git-scm.com/).

---

### Option A: 1-Click Automated Startup (`run.bat`)

1. Open your cloned repository folder in Windows File Explorer:
   ```
   C:\path\to\TRACE-X
   ```
2. Double-click **`run.bat`** (or execute in Command Prompt: `run.bat`).
3. The script automatically:
   - Verifies Python 3.10+ and Node.js are available.
   - Creates the virtual environment `backend\venv` if missing.
   - Installs all backend packages from `backend\requirements.txt`.
   - Installs frontend packages via `npm install` if missing.
   - Spawns the FastAPI backend window on port `8000`.
   - Spawns the React Vite frontend window on port `5173`.
   - Opens your default web browser to `http://localhost:5173`.

---

### Option B: PowerShell 1-Click Startup (`run.ps1`)

If you prefer Windows PowerShell or Windows Terminal:

```powershell
# Open PowerShell as Administrator or regular user, then navigate to the project:
cd C:\path\to\TRACE-X

# If script execution is restricted on your system, allow process-level execution:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run the launcher:
.\run.ps1
```

---

### Option C: Manual Command Prompt (`cmd.exe`) Setup

If you wish to configure and run the servers manually in separate Command Prompt windows:

#### Step 1: Clone Repository
```cmd
git clone https://github.com/mullaadil/TRACE-X.git
cd TRACE-X
```

#### Step 2: Set Up Python Backend (Terminal 1)
```cmd
:: Create virtual environment
python -m venv backend\venv

:: Activate virtual environment
call backend\venv\Scripts\activate.bat

:: Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

:: Launch FastAPI backend
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend will be active at: `http://localhost:8000`
* Interactive API Documentation: `http://localhost:8000/docs`

#### Step 3: Set Up React Frontend (Terminal 2)
Open a second Command Prompt window:
```cmd
cd C:\path\to\TRACE-X\frontend

:: Install npm dependencies
npm install

:: Start Vite dev server
npm run dev
```
* Frontend will be active at: `http://localhost:5173`

---

### Windows Troubleshooting

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `'python' is not recognized` | Python was not added to PATH | Reinstall Python and ensure **"Add python.exe to PATH"** is selected, or use `py -3`. |
| `Execution of scripts is disabled` | Windows PowerShell execution policy | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` before executing `.ps1`. |
| `Port 8000 or 5173 in use` | Another process is holding the port | Run `netstat -ano \| findstr :8000` and kill the PID with `taskkill /PID <PID> /F`. |
| Windows Firewall Alert | First time running local network server | Click **"Allow access"** for Python and Node.js on Private Networks. |

---

## 6. macOS & Linux Setup Guide

### Prerequisites
* Python 3.10+
* Node.js v18+ & npm

### One-Click Launch
```bash
chmod +x run.sh
./run.sh
```

This automatically launches:
* **FastAPI Backend**: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)
* **React Frontend**: `http://localhost:5173`

---

## 7. Docker Setup & Local Execution

TRACE-X provides a production-grade, multi-stage `Dockerfile` and `docker-compose.yml` that packages both the frontend and backend into a single container.

### Method 1: Using Docker Compose (Recommended)

From the repository root:

```bash
# Build and start the container in detached mode
docker compose up --build -d

# Check container status
docker compose ps

# View live application logs
docker compose logs -f
```

* **Application URL**: `http://localhost` (or `http://localhost:8000`)
* **API Documentation**: `http://localhost/docs`

To stop the container:
```bash
docker compose down
```

---

### Method 2: Using the Docker CLI Directly

```bash
# 1. Build the production image
docker build -t trace-x:latest .

# 2. Run container mapping host port 8000 to container port 8000
docker run -d --name trace-x-app -p 8000:8000 trace-x:latest

# 3. Test the container health check
curl http://localhost:8000/api/health
```

---

## 8. Docker in GitHub (CI/CD & GHCR Registry)

TRACE-X includes automated GitHub Actions workflows located in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) to continuously build, test, and package Docker containers on GitHub.

```
       Git Push / PR to main
                 │
                 ▼
  ┌──────────────────────────────┐
  │  GitHub Actions CI Runner    │
  └──────────────┬───────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
 [Pytest Backend]  [Build Frontend]
   (Python 3.11)      (Node 20)
        └────────┬────────┘
                 │
                 ▼
     [Build & Test Docker]
   Multi-stage build verification
                 │
                 ▼
  [Publish to GitHub Container Registry]
       ghcr.io/mullaadil/trace-x
```

### Automated GitHub Actions Workflow Features
1. **Automated Backend Testing**: Runs all 19 pytest unit and integration tests under Python 3.11.
2. **Automated Frontend Build**: Runs TypeScript validation and Vite production build.
3. **Automated Docker Image Build**: Compiles the multi-stage Dockerfile inside the GitHub runner.
4. **Automated Container Health Verification**: Spawns the built container, queries `http://localhost:8000/api/health`, verifies `/api/dashboard/stats`, and verifies the React SPA is served.
5. **GitHub Container Registry (GHCR) Publishing**: Automatically tags and pushes images to `ghcr.io` on pushes to `main`.

### Pulling and Running the Pre-built Image from GitHub
Once published to GHCR, any investigator or evaluator can run TRACE-X without installing Python or Node.js:

```bash
# Pull the latest image from GitHub Container Registry
docker pull ghcr.io/mullaadil/trace-x:latest

# Run the container locally
docker run -d -p 8000:8000 --name trace-x ghcr.io/mullaadil/trace-x:latest

# Open in browser
open http://localhost:8000
```

---

## 9. AWS Free Tier Cloud Deployment

TRACE-X is fully optimized for **AWS Free Tier (EC2 t2.micro or t3.micro)** with a 1-click provisioning script and full documentation in [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md).

### Quick 1-Command Deployment on EC2
Once connected to your EC2 instance (Amazon Linux 2023 or Ubuntu 22.04 LTS):

```bash
# Clone the repository
git clone https://github.com/mullaadil/TRACE-X.git
cd TRACE-X

# Run the automated deployment script
chmod +x deploy_aws_ec2.sh
./deploy_aws_ec2.sh
```

The script automatically:
* Configures a 2GB virtual memory swap file (preventing OOM errors on 1GB RAM Free Tier instances).
* Installs system dependencies (Python 3, Node.js 20, Git, Uvicorn, Nginx).
* Builds the React frontend production bundle.
* Configures a `systemd` background service (`trace-x.service`) with auto-restart on reboot.
* Binds Nginx reverse proxy on port 80.

---

## 10. Key Platform Features (14 Core Modules)

1. **Cyber SOC Overview Dashboard**:
   - High-density telemetry counters for Evidence Records (1,356), Canonical Entities (1,010), Correlated Links (407), Ethereum Txs (260), CTI IOCs (154), and Dark Web Threads (201).
   - Real-time chronological activity stream with direct evidence inspection.
2. **Investigation Case Management**:
   - Create, track, and update formal forensic case files with Case IDs, target entities, assigned analysts, status boards, and findings notes.
3. **Unified Cross-Source Search**:
   - Universal search engine indexing aliases, Ethereum wallet addresses, hostnames, IPs, payload hashes, PGP fingerprints, and dark web thread IDs.
4. **360° Entity Profile Dossier**:
   - Deep entity summary, risk score badges, connected entities tree with forensic rationales, and supporting evidence IDs.
5. **Interactive Cytoscape Correlation Graph**:
   - GPU-accelerated graph canvas with color-coded nodes, dynamic type filters, zoom/pan controls, and clickable edges displaying *"Why are these two entities considered related?"*.
6. **Blockchain Forensic Intelligence**:
   - Ethereum mainnet block ledger inspection, wallet flow analyzer, incoming/outgoing volume metrics, and **live Ethereum mainnet address / transaction hash queries** via Alchemy JSON-RPC.
7. **CTI MISP Intelligence**:
   - Packrat APT campaign dossier with threat levels, targeted regions (Ecuador, Argentina, Venezuela, Brazil), and filterable IOC tables (domain, IP, hash, URL).
8. **Dark Web Research Corpus**:
   - Forum leak thread analysis, target domain extraction, and explicit author anonymity protection banner (`[AUTHOR]`).
9. **OpenPGP Keyring Intelligence**:
   - CIRCL reference key verification and interactive RFC 4880 ASCII Armor public key importer with checksum validation.
10. **Master Unified Timeline**:
    - Chronological synthesis of events spanning all four data sources with dynamic source filtering.
11. **Forensic Evidence Explorer**:
    - Complete chain-of-custody registry with cryptographic SHA-256 integrity hashes, collection timestamps, and provenance tracking.
12. **Forensic Investigation Report Generator**:
    - Formal investigation report builder with entity overviews, digital indicators, correlation findings, and official attribution verdicts. Supports printable layout and Markdown export.
13. **AI Investigation Copilot**:
    - Grounded investigative assistant strictly tethered to ingested evidence records, returning supporting evidence IDs with each finding.
14. **Interactive Evaluator Demo Walkthrough**:
    - 10-step guided demo mode designed specifically for SIH evaluators covering the end-to-end investigative workflow.

---

## 11. REST API Reference

The FastAPI backend exposes clean, fully-typed OpenAPI endpoints. When running, visit `http://localhost:8000/docs` for the interactive Swagger UI.

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Service health status and timestamp |
| `/api/dashboard/stats` | `GET` | Overview counters and domain telemetry |
| `/api/dashboard/activity` | `GET` | Recent chronological forensic activities |
| `/api/investigations` | `GET`, `POST` | List all cases or create a new forensic case |
| `/api/investigations/{id}` | `GET`, `PUT` | Retrieve or update a specific case |
| `/api/search` | `GET` | Universal search across all entities and indicators |
| `/api/entities/{id}` | `GET` | 360° entity dossier with connected entities |
| `/api/graph/data` | `GET` | Cytoscape graph nodes, edges, and cluster metadata |
| `/api/blockchain/overview` | `GET` | Blockchain metrics and summary |
| `/api/blockchain/transactions` | `GET` | Filtered list of Ethereum transactions |
| `/api/blockchain/wallets/{addr}` | `GET` | Wallet dossier, counterparty clusters, on-chain lookup |
| `/api/cti/overview` | `GET` | Packrat APT campaign overview and IOC lists |
| `/api/darkweb/stats` | `GET` | Dark web forum threads and target domain metrics |
| `/api/pgp/keys` | `GET`, `POST` | List verified PGP keys or import ASCII armor key |
| `/api/timeline` | `GET` | Cross-source unified chronological timeline |
| `/api/evidence` | `GET` | Complete chain-of-custody evidence registry |
| `/api/reports/generate/{id}` | `GET` | Generate formal forensic investigation report |
| `/api/assistant/chat` | `POST` | Evidence-grounded AI copilot query |

---

## 12. Verification & Automated Testing

### Backend Unit & Integration Tests (19 tests)
To run the automated test suite locally:

```bash
# On macOS / Linux:
PYTHONPATH=. backend/venv/bin/pytest backend/tests -v

# On Windows (Command Prompt):
call backend\venv\Scripts\activate.bat
set PYTHONPATH=.
pytest backend\tests -v
```

**Test Suite Coverage**:
- Ingestion of all 260 blockchain transactions, 154 CTI indicators, 201 dark web threads, and PGP keyrings.
- Deterministic correlation algorithms and explainable scoring formulas.
- All FastAPI REST endpoints, search indexers, report generators, and AI assistant guardrails.
- Live Ethereum address and transaction hash enrichment logic.

### Frontend Typechecking & Production Build
```bash
cd frontend
npm run build
```
Validates TypeScript typings, component exports, Cytoscape graph bindings, and bundles the production asset bundle.

---

## 13. Responsible Attribution & SIH26151 Compliance

TRACE-X strictly adheres to the ethical and technical guidelines set by NTRO and the Smart India Hackathon:

* **No Active Tor Attacks**: Does not exploit Tor exit nodes, perform timing correlation attacks on live circuits, or conduct unauthorized penetration testing.
* **No Unlawful PII Scraping**: Does not violate privacy rights or harvest personal data without legal authorization.
* **Strict Separation of Inferences vs. Facts**: Observed indicators (e.g. wallet transactions, domain registrations) are strictly separated from inferences.
* **Clearly Tagged Synthetic Demonstrations**: In the evaluator demo workflow, physical person attribution is illustrated strictly using a synthetic legal record tagged `[SYNTHETIC AUTHORIZED EVIDENCE]` to demonstrate legal compliance workflows without fabricating real-world identities.

---

<div align="center">

**TRACE-X Platform — Developed for Smart India Hackathon (SIH26151)**  
*National Technical Research Organisation (NTRO)*

</div>
