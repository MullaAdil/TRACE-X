#!/usr/bin/env bash
# ==============================================================================
# TRACE-X: Automated Server Update Script
# Pulls latest changes from GitHub, updates dependencies, rebuilds frontend & restarts
# ==============================================================================

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "[1/4] Pulling latest code from GitHub..."
git checkout -- frontend/package-lock.json 2>/dev/null || true
git pull origin main

echo "[2/4] Updating Python dependencies..."
if [ -d "backend/venv" ]; then
    backend/venv/bin/pip install --upgrade pip -q
    backend/venv/bin/pip install -r backend/requirements.txt -q
fi

echo "[3/4] Building Frontend Production Bundle..."
if [ -d "frontend" ]; then
    cd "$APP_DIR/frontend"
    npm install --silent
    npm run build
    cd "$APP_DIR"
    
    # Ensure visual assets are preserved in dist
    mkdir -p frontend/dist/src/assets
    cp -r frontend/src/assets/visuals frontend/dist/src/assets/ 2>/dev/null || true
    chmod -R 755 frontend/dist 2>/dev/null || true
fi

echo "[4/4] Restarting TRACE-X and Nginx Services..."
sudo systemctl restart tracex
sudo systemctl restart nginx

echo "========================================================================"
echo " ✅ TRACE-X Server Successfully Updated!"
echo " Live at: https://13-218-221-43.sslip.io"
echo "========================================================================"
