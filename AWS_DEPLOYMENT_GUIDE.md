# TRACE-X: Complete AWS Free Tier Deployment Guide

This guide walks you step-by-step through deploying the **TRACE-X Platform** onto an **Amazon Web Services (AWS) Free Tier** virtual machine (EC2 instance) with zero monthly cost.

---

## Architecture Overview on AWS Free Tier

```
 Internet Browser (Client)
        │
        ▼ (Port 80 / 443)
┌───────────────────────────────────────────────────────────┐
│ AWS EC2 (t2.micro / t3.micro — Ubuntu 24.04 LTS)         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Nginx Web Server (Port 80)                          │  │
│  │  ├─ Serves React Frontend (frontend/dist/) at /     │  │
│  │  └─ Reverse Proxies /api/ and /docs to Port 8000    │  │
│  └─────────────────────────────────────────────────────┘  │
│                            │                              │
│                            ▼ (Internal 127.0.0.1:8000)    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ FastAPI + Uvicorn (Systemd: tracex.service)         │  │
│  │  ├─ Correlation Engine & Forensic Adapters          │  │
│  │  ├─ SQLite Database (backend/trace_x.db)            │  │
│  │  └─ Live Alchemy Remote Procedure Call (RPC)        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 2GB Swap Memory (Protects 1GB RAM against OOM)      │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

---

## Free Tier Eligibility Checklist

AWS Free Tier gives you:
- **750 hours/month** of Linux `t2.micro` (or `t3.micro` in regions where available). *(750 hours = 24 hours × 31 days, meaning 1 instance can run 24/7 all month completely free!)*
- **30 GB** of EBS storage (gp2/gp3).
- **15 GB** of outbound data transfer per month.

---

## Step 1: Launch Your Free EC2 Instance

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. In the top search bar, type **EC2** and click on the EC2 service.
3. Click the orange **"Launch instance"** button.
4. Fill in the following details:
   - **Name:** `TRACE-X-Server`
   - **Application and OS Images (AMI):** Select **Ubuntu** (choose `Ubuntu Server 24.04 LTS` or `22.04 LTS` — look for the **"Free tier eligible"** label).
   - **Instance type:** Select `t2.micro` (or `t3.micro` if in a region where t3 is free tier eligible).
   - **Key pair (login):**
     - Select an existing key pair, or click **"Create new key pair"**.
     - Name it `tracex-key`, key pair type **RSA**, private key format **`.pem`**, and click **Create key pair** (a file will download to your computer).
5. **Network settings (Firewall / Security Group):**
   - Select **"Create security group"**.
   - Make sure all three checkboxes are **CHECKED**:
     - [x] **Allow SSH traffic from Anywhere (0.0.0.0/0)** *(Port 22)*
     - [x] **Allow HTTP traffic from the internet** *(Port 80)*
     - [x] **Allow HTTPS traffic from the internet** *(Port 443)*
6. **Configure storage:**
   - Change the size to `25 GiB` or keep the default `8 GiB` of `gp3` (up to 30 GB is 100% free).
7. Click the orange **"Launch instance"** button on the bottom right.
8. Wait ~30-60 seconds until the instance state changes to **"Running"**.

---

## Step 2: Connect to Your EC2 Instance

You have two easy options to connect:

### Option A: 1-Click Browser Terminal (No terminal or key setup needed!)
1. In the EC2 console, check the box next to your instance (`TRACE-X-Server`).
2. Click the **"Connect"** button at the top.
3. Select the **"EC2 Instance Connect"** tab.
4. Click the orange **"Connect"** button.
5. A black terminal window opens directly inside your web browser!

### Option B: From Your Mac / Linux Terminal using SSH
1. Open your terminal and navigate to the folder where your `.pem` key was downloaded:
   ```bash
   cd ~/Downloads
   chmod 400 tracex-key.pem
   ```
2. Connect to your instance (replace with your instance's Public IPv4 address from the EC2 console):
   ```bash
   ssh -i tracex-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
   ```

---

## Step 3: Run the 1-Click Automated Deployment Script

Once connected to your EC2 instance, copy and run these 3 commands:

```bash
git clone https://github.com/MullaAdil/TRACE-X.git
cd TRACE-X
bash deploy_aws_ec2.sh
```

### What does the automated script do?
1. **Allocates a 2GB Swap file:** `t2.micro` instances have 1GB of RAM. The script automatically configures 2GB of virtual swap memory so `npm run build` and Python packages never run out of memory.
2. **Installs System Dependencies:** Installs Python 3, pip, venv, Node.js 20.x LTS, Git, and Nginx.
3. **Builds the Frontend:** Installs NPM packages and compiles the React + Vite frontend into optimized static assets.
4. **Initializes the Database:** Sets up SQLite and primes forensic intelligence datasets.
5. **Configures Background Service (`tracex.service`):** Configures Linux `systemd` to keep FastAPI running 24/7 and auto-restarts if the server reboots.
6. **Configures Nginx:** Sets up Nginx on Port 80 to serve the website and reverse-proxy API calls.

The script will complete in ~2-3 minutes and print your live website URL!

---

## Step 4: Access Your Live Website!

Open your web browser and navigate to:
```
http://<YOUR-EC2-PUBLIC-IP>
```
*(You can find your Public IPv4 address on the EC2 Instances page).*

- **Website Dashboard:** `http://<YOUR-EC2-PUBLIC-IP>/`
- **Interactive REST API Documentation:** `http://<YOUR-EC2-PUBLIC-IP>/docs`
- **API Health Check:** `http://<YOUR-EC2-PUBLIC-IP>/api/health`

---

## Useful Maintenance Commands

| Action | Command |
| :--- | :--- |
| **Check Backend Status** | `sudo systemctl status tracex` |
| **View Live Backend Logs** | `sudo journalctl -u tracex -f` |
| **Restart Backend Server** | `sudo systemctl restart tracex` |
| **Restart Nginx Web Server** | `sudo systemctl restart nginx` |
| **Check Memory & Swap Usage** | `free -h` |

### How to Update with New Code from GitHub
Whenever you push new changes to GitHub, update your live AWS instance by running:
```bash
cd ~/TRACE-X
git pull origin main
cd frontend && npm run build && cd ..
sudo systemctl restart tracex
sudo systemctl restart nginx
```

---

## Optional: Setup Free HTTPS / SSL with Let's Encrypt (If you have a domain)

If you connect a domain name (e.g. `tracex.yourdomain.com`) to your EC2 Public IP address, you can get a free SSL certificate in 10 seconds:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tracex.yourdomain.com
```
Certbot will automatically configure HTTPS encryption and renew certificates automatically.

---

## How to Guarantee Zero AWS Charges (Stay 100% Free)

1. **Keep only 1 instance active:** The 750 free hours covers 1 `t2.micro` or `t3.micro` instance running 24 hours a day for the whole month. Do not keep multiple instances running simultaneously.
2. **Storage:** Stay within the 30 GB EBS limit (the script uses ~10-15 GB).
3. **If you ever want to pause:** Go to the EC2 console, select `TRACE-X-Server`, click **Instance state** -> **Stop instance**. (You can restart it at any time).
