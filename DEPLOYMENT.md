# VulnScan Deployment Guide

This guide details multiple deployment methods for **VulnScan** (AI-Powered Vulnerability Detection & DevSecOps Platform), ranging from free cloud hosting to containerized production servers.

---

## Architecture Overview

VulnScan consists of three decoupled components:
1. **Frontend**: Next.js 14 App Router, React, Tailwind CSS (Default port `3000`)
2. **Backend**: FastAPI REST API, SQLAlchemy, Dynamic Scanner Orchestrator (Default port `8000`)
3. **Demo Target Lab**: iCream Shop artisan boutique with toggleable vulnerability states (Default port `8001`)

---

## Option 1: 100% Free Cloud Deployment (Vercel + Render)

This is the recommended serverless cloud deployment:

### Step 1: Deploy Backend to Render (Free Tier)
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Blueprint**.
3. Connect your repository: `https://github.com/kandharipiyush/VulnScan`.
4. Render will automatically detect `render.yaml` and configure both backend and frontend, or you can create a **Web Service**:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Note your backend URL (e.g. `https://vulnscan-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel (Free Tier)
1. Go to [vercel.com](https://vercel.com) and import the `kandharipiyush/VulnScan` repository.
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_API_URL=https://vulnscan-backend.onrender.com/api
   ```
4. Click **Deploy**. Vercel will build and deploy the frontend with global edge acceleration.

---

## Option 2: Docker Compose (Single Server / AWS EC2 / DigitalOcean)

Deploy all three services with a single command on any server with Docker and Docker Compose installed:

```bash
# 1. Clone your repository
git clone https://github.com/kandharipiyush/VulnScan.git
cd VulnScan

# 2. (Optional) Set your Gemini API key in .env
echo "GEMINI_API_KEY=your_key_here" > .env

# 3. Build and launch all services in detached mode
docker compose up -d --build
```

### Accessing Services:
- **Web Application**: `http://<your-server-ip>:3000`
- **Backend API & Docs**: `http://<your-server-ip>:8000/docs`
- **Vulnerable Lab Target**: `http://<your-server-ip>:8001`

---

## Option 3: Railway Deployment (One-Click)

1. Go to [railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
2. Select `kandharipiyush/VulnScan`.
3. Add service for `backend` (Docker build using `backend/Dockerfile`).
4. Add service for `frontend` (Docker build using `frontend/Dockerfile` or Node build).
5. Set `NEXT_PUBLIC_API_URL` on frontend pointing to the backend railway domain.

---

## Production Environment Variables

### Backend (`backend/.env`):
| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `sqlite:///./vulnscan.db` |
| `SECRET_KEY` | Cryptographic secret for signing sessions | Change to high-entropy string in production |
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant & explanations | Optional (falls back to expert rule engine) |
| `ALLOW_LOCALHOST` | Allows scanning local internal endpoints | `True` |

### Frontend (`frontend/.env.production`):
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Public URL of the FastAPI backend | `https://api.yourdomain.com/api` |

