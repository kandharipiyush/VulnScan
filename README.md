# VulnScan 🛡️
## AI-Powered Automated Vulnerability Detection, Security Validation & DevSecOps Platform

> **"Find vulnerabilities before attackers do."**

VulnScan is an automated cybersecurity platform that unifies Static Application Security Testing (SAST), Dynamic Application Security Testing (DAST), Software Composition Analysis (SCA), Hardcoded Secret Detection, and AI-powered fix verification in one platform.

---

## 🌟 The Primary Demonstration Workflow

```
[ iCream Shop (Port 8001) ]
           │
           ▼
[ Launch Scan via Wizard ]
           │
           ▼
[ Multi-Vector Detection ] ──► (SQLi, Reflected XSS, Stored XSS, IDOR, Secrets, SCA)
           │
           ▼
[ Vulnerability Explorer ] ──► (View technical evidence & side-by-side code diff)
           │
           ▼
[ AI Security Assistant ]  ──► (Explain root cause & generate parameterized patch)
           │
           ▼
[ Toggle Secure Mode ]     ──► (Switch iCream Shop to parameterized prepared queries)
           │
           ▼
[ Verify Fix (Rescan) ]    ──► (Status updates to FIXED & unblocks CI/CD gate)
           │
           ▼
[ Generate Report ]        ──► (Download executive & technical ReportLab PDF)
```

---

## 🚀 Key Features

1. **Three Ingestion Vectors:**
   - **Localhost Website Scanning:** Directly audit applications running on `http://localhost:3000` or local dev ports.
   - **Deployed Website Auditing:** Audit live URLs with domain authorization boundaries, HTTP security headers, and active non-destructive canary tests.
   - **GitHub Repository & Source Scanning:** Static AST pattern scanning (Semgrep-inspired), SCA dependency CVE scanning, and credential regex pattern matching.
2. **AI-Powered Vulnerability Intelligence:**
   - Automatically correlates findings, maps CWE/CVE identifiers, assesses threat severity, and generates context-aware side-by-side code patches.
   - Built-in fallback expert cybersecurity engine ensures full functionality even without an external API key.
3. **Controlled Security Validation Lab:**
   - Allows security teams to validate findings using harmless canaries, non-destructive boolean boundary tests, and synthetic account isolation checks.
4. **DevSecOps & CI/CD Integration:**
   - Configurable Security Gates (`STRICT`, `BALANCED`, `MONITOR`) to block commits or pull requests with critical vulnerabilities.
   - Ready-to-copy GitHub Actions workflow YAML.
5. **Enterprise PDF Report Generation:**
   - Generates comprehensive PDF assessment reports with cover page, executive metrics, finding tables, and remediation roadmaps using ReportLab.
   - JSON and CSV exports for SIEM and spreadsheets.
6. **Featured Demo Target: iCream Shop:**
   - Artisanal ice cream e-commerce boutique running locally on port 8001.
   - Toggle switch between **Vulnerable Lab Mode** and **Secure Mode** to demonstrate the complete detection and remediation lifecycle.

---

## 🏗️ System Architecture

```
vulnscan/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application & startup seed
│   │   ├── database.py             # SQLAlchemy ORM (SQLite / PostgreSQL)
│   │   ├── models.py               # Projects, Scans, Vulnerabilities, Reports, CI/CD
│   │   ├── schemas.py              # Pydantic request & response models
│   │   ├── scanners/
│   │   │   ├── orchestrator.py     # Multi-stage scan coordinator
│   │   │   ├── sast.py             # Static AST pattern matching engine
│   │   │   ├── dast.py             # Dynamic crawler & non-destructive tester
│   │   │   ├── sca.py              # Software Composition Analysis engine
│   │   │   └── secrets.py          # Secret & API key detector
│   │   ├── ai/
│   │   │   └── security_ai.py      # AI intelligence & patch generator
│   │   ├── reports/
│   │   │   └── pdf_generator.py    # ReportLab PDF report compiler
│   │   └── api/                    # Modular REST endpoints
│   ├── generated_reports/          # Storage for generated PDF assessments
│   └── seed.py                     # Initial database seeding script
├── frontend/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── page.tsx                # Enterprise marketing landing page
│   │   ├── dashboard/page.tsx      # Overview KPIs & Recharts analytics
│   │   ├── projects/page.tsx       # Project management
│   │   ├── scans/new/page.tsx      # Multi-step scanning wizard
│   │   ├── scans/[id]/page.tsx     # Live scan monitor & log console
│   │   ├── vulnerabilities/        # Vulnerability Explorer & detail view
│   │   ├── validation/page.tsx     # Security Validation Lab
│   │   ├── assistant/page.tsx      # AI Security Assistant chatbot
│   │   ├── reports/page.tsx        # PDF, JSON, and CSV downloads
│   │   ├── analytics/page.tsx      # Severity & category trend graphs
│   │   ├── cicd/page.tsx           # DevSecOps gate simulator
│   │   └── integrations/github/    # GitHub repository connection
│   └── components/                 # Sidebar, Header, custom icons
├── icream-shop/
│   ├── app.py                      # Artisanal boutique target with mode toggle
│   └── requirements.txt            # Package manifest with known CVEs for SCA
├── test_system.py                  # End-to-end automated audit test script
└── run_vulnscan.py                 # Single-command launcher for all services
```

---

## ⚡ Quick Start & Running VulnScan

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Run the Automated Audit Test Suite
Verify that all scanner engines, database persistence, AI fixes, and PDF reporting work:
```powershell
python test_system.py
```

### Step 2: Launch All Services (One Command)
```powershell
python run_vulnscan.py
```

This starts:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **iCream Shop Demo Target:** [http://127.0.0.1:8001](http://127.0.0.1:8001)

### Demo Credentials
- **Email:** `demo@vulnscan.sec`
- **Password:** `Demo123!`
*(A one-click autofill button is also provided on `/login`)*

---

## 🧪 Testing with External Targets

VulnScan's dynamic scanning engine also supports standard open-source security training environments:

1. **OWASP Juice Shop:**
   ```bash
   docker run -d -p 3000:3000 bkimminich/juice-shop
   ```
   In VulnScan, select **Localhost Website** and enter `http://localhost:3000`.

2. **OWASP crAPI:**
   ```bash
   docker compose -f docker-compose.yml up -d
   ```
   Enter `http://localhost:8888` to test API authorization boundaries.

