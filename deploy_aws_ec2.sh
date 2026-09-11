#!/usr/bin/env bash
# ==============================================================================
# TRACE-X: Automated 1-Click AWS Free Tier (EC2 Ubuntu) Deployment Script
# Designed specifically for AWS Free Tier (t2.micro / t3.micro - 1GB RAM)
# ==============================================================================

set -e

echo "========================================================================"
echo " Starting TRACE-X Deployment on AWS Free Tier EC2"
echo " OS: Ubuntu 22.04 / 24.04 LTS"
echo "========================================================================"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# 1. Setup 2GB Swap Memory (CRITICAL for AWS Free Tier 1GB RAM t2.micro)
echo "[1/7] Configuring 2GB Swap Memory..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap memory enabled: $(free -h | grep Swap)"
else
    echo "Swap file already exists."
fi

# 2. Update packages and install prerequisites
echo "[2/7] Installing System Packages (Python, Git, Nginx, Curl)..."
sudo apt-get update -y
sudo apt-get install -y python3-pip python3-venv python3-dev build-essential git curl nginx

# Install Node.js 20.x LTS if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x LTS via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "Node: $(node -v), NPM: $(npm -v), Python: $(python3 --version)"

# 3. Setup Python Virtual Environment & Install Dependencies
echo "[3/7] Setting up Python Virtual Environment..."
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
fi
backend/venv/bin/pip install --upgrade pip
backend/venv/bin/pip install -r backend/requirements.txt

# 4. Build React + TypeScript Frontend
echo "[4/7] Building Frontend Production Bundle..."
cd "$APP_DIR/frontend"
npm install
npm run build
cd "$APP_DIR"

# 5. Initialize Database & Correlation Index
echo "[5/7] Initializing SQLite Database & Forensic Models..."
PYTHONPATH=. backend/venv/bin/python3 -c "
from backend.app.database import engine, Base, SessionLocal
from backend.app.engine.normalizer import IngestionManager
from backend.app.engine.correlation import CorrelationEngine

Base.metadata.create_all(bind=engine)
db = SessionLocal()
try:
    im = IngestionManager(db)
    im.run_ingestion(reset=False)
    ce = CorrelationEngine(db)
    ce.run_correlation(reset=False)
    print('Database and correlation tables successfully verified.')
finally:
    db.close()
"

# 6. Configure Systemd Service (Keep backend running 24/7)
echo "[6/7] Configuring Systemd Service (tracex.service)..."
CURRENT_USER=$(whoami)

sudo bash -c "cat <<EOF > /etc/systemd/system/tracex.service
[Unit]
Description=TRACE-X Threat Attribution Engine
After=network.target

[Service]
User=$CURRENT_USER
WorkingDirectory=$APP_DIR
ExecStart=$APP_DIR/backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5
Environment=PORT=8000
Environment=PYTHONPATH=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF"

sudo systemctl daemon-reload
sudo systemctl enable tracex
sudo systemctl restart tracex

# 7. Configure Nginx Web Server (Reverse Proxy + Static Frontend)
echo "[7/7] Configuring Nginx..."
sudo bash -c "cat <<EOF > /etc/nginx/sites-available/tracex
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root $APP_DIR/frontend/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend Single Page App Routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Reverse Proxy API requests to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Reverse Proxy OpenAPI Docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host \$host;
    }
    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host \$host;
    }
}
EOF"

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/tracex /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Retrieve Public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://api.ipify.org || echo "YOUR-EC2-PUBLIC-IP")

echo ""
echo "========================================================================"
echo " 🎉 TRACE-X SUCCESSFULLY DEPLOYED ON AWS EC2!"
echo "========================================================================"
echo " Website URL:     http://$PUBLIC_IP"
echo " Backend API:     http://$PUBLIC_IP/api"
echo " Interactive Docs: http://$PUBLIC_IP/docs"
echo " Backend Status:  sudo systemctl status tracex"
echo " Service Logs:    sudo journalctl -u tracex -f"
echo "========================================================================"
