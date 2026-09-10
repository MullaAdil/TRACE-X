#!/usr/bin/env bash
# ==============================================================================
# TRACE-X: Threat Actor Correlation & Attribution Engine (SIH26151)
# One-click startup script for macOS
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================================"
echo " Starting TRACE-X (SIH26151) Platform"
echo " Problem: Dark Web Threat Actor De-anonymization"
echo " Organization: National Technical Research Organisation (NTRO)"
echo "========================================================================"

# 1. Activate Python virtual environment & start FastAPI backend
echo "[1/2] Launching Python FastAPI Backend on http://localhost:8000..."
source backend/venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 2. Start Vite React Frontend
echo "[2/2] Launching React+TypeScript SOC Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Trap signals to shut down cleanly
trap 'echo -e "\nShutting down TRACE-X..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' SIGINT SIGTERM EXIT

echo ""
echo "========================================================================"
echo " TRACE-X IS RUNNING!"
echo " Frontend URL:  http://localhost:5173"
echo " Backend API:   http://localhost:8000"
echo " API Docs:      http://localhost:8000/docs"
echo "========================================================================"
echo "Press Ctrl+C to stop both servers."

wait
