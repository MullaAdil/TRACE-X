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

# 2. Detect OS & Install System Packages (Amazon Linux vs Ubuntu)
echo "[2/7] Detecting OS and Installing System Packages..."
if command -v dnf &> /dev/null; then
    echo "Detected Amazon Linux 2023 / Fedora (dnf package manager)"
    sudo dnf update -y
    sudo dnf install -y python3 python3-pip git nginx nodejs npm gcc python3-devel tar
elif command -v yum &> /dev/null; then
    echo "Detected Amazon Linux 2 (yum package manager)"
    sudo yum update -y
    sudo yum install -y python3 python3-pip git nginx nodejs npm gcc python3-devel tar
elif command -v apt-get &> /dev/null; then
    echo "Detected Ubuntu / Debian (apt package manager)"
    sudo apt-get update -y
    sudo apt-get install -y python3-pip python3-venv python3-dev build-essential git curl nginx
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js 20.x LTS via NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
else
    echo "Unsupported package manager. Please install Python 3, Node.js, and Nginx manually."
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

# Ensure web server can read frontend/dist (prevents 403 on Amazon Linux / Ubuntu)
chmod 755 /home/$(whoami) 2>/dev/null || true
chmod -R 755 "$APP_DIR/frontend/dist" 2>/dev/null || true

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

NGINX_CONF="server {
    listen 80;
    server_name _;

    root $APP_DIR/frontend/dist;
    index index.html;

    # High-Performance Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Aggressive 30-Day Browser Caching for Production Assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files \$uri =404;
    }

    # Frontend Single Page App Routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Reverse Proxy API requests to FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_buffering on;
        proxy_buffers 8 64k;
        proxy_buffer_size 128k;
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
}"

if [ -d "/etc/nginx/sites-available" ]; then
    # Ubuntu / Debian
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo rm -f /etc/nginx/conf.d/tracex.conf
    echo "$NGINX_CONF" | sudo tee /etc/nginx/sites-available/tracex > /dev/null
    sudo ln -sf /etc/nginx/sites-available/tracex /etc/nginx/sites-enabled/
else
    # Amazon Linux / RHEL / CentOS
    echo "$NGINX_CONF" | sudo tee /etc/nginx/conf.d/tracex.conf > /dev/null
    sudo sed -i 's/listen       80 default_server;/listen       8080;/g' /etc/nginx/nginx.conf 2>/dev/null || true
    sudo sed -i 's/listen       \[::\]:80 default_server;/listen       \[::\]:8080;/g' /etc/nginx/nginx.conf 2>/dev/null || true
fi
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

sudo nginx -t
sudo systemctl enable nginx
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
