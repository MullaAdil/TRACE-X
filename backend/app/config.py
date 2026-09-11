import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Detect data directory (prefers data/, falls back to trace-x-data/)
DATA_DIR = BASE_DIR / "data"
if not DATA_DIR.exists() or not (DATA_DIR / "blockchain").exists():
    DATA_DIR = BASE_DIR / "trace-x-data"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR}/trace_x.db")
ALCHEMY_ETH_RPC_URL = os.getenv(
    "ALCHEMY_ETH_RPC_URL",
    "https://eth-mainnet.g.alchemy.com/v2/alch_9YJOoCFSssXT0-cQvgk8I"
)

APP_NAME = "TRACE-X"
APP_DESCRIPTION = "Autonomous Threat Actor Correlation & Forensic Attribution Platform"
VERSION = "1.0.0"

# Scoring weights (Explainable Confidence Formulation)
SCORING_WEIGHTS = {
    "EXACT_CRYPTO_HASH": 0.95,
    "EXACT_PGP_FINGERPRINT": 0.95,
    "EXACT_WALLET": 0.90,
    "EXACT_DOMAIN_OR_IP": 0.85,
    "SHARED_INFRASTRUCTURE": 0.75,
    "TRANSACTS_WITH": 0.80,
    "REFERENCES": 0.60,
    "APPEARS_IN_LEAK": 0.65,
    "TEXTUAL_COOCCURRENCE": 0.40,
    "WEAK_SIMILARITY": 0.20,
    "MULTI_SOURCE_BOOST": 1.25, # Boost factor when observed across multiple independent sources
}
