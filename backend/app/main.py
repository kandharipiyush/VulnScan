import os
import hashlib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Project, ScanJob, Vulnerability, ScanLog
from app.api import auth, projects, scans, vulnerabilities, validation, assistant, reports, analytics, cicd, github
from app.scanners.orchestrator import ScanOrchestrator

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Automated Vulnerability Detection & Security Validation Platform"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(projects.router, prefix=settings.API_PREFIX)
app.include_router(scans.router, prefix=settings.API_PREFIX)
app.include_router(vulnerabilities.router, prefix=settings.API_PREFIX)
app.include_router(validation.router, prefix=settings.API_PREFIX)
app.include_router(assistant.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(cicd.router, prefix=settings.API_PREFIX)
app.include_router(github.router, prefix=settings.API_PREFIX)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VulnScan API",
        "version": settings.VERSION,
        "database": "connected"
    }

@app.get("/api/demo-target/mode")
def get_demo_target_mode():
    import requests
    try:
        url = f"{settings.ICREAM_SHOP_URL.rstrip('/')}/api/mode"
        res = requests.get(url, timeout=3)
        return res.json()
    except Exception as e:
        return {"mode": "vulnerable", "fallback": True, "error": str(e)}

@app.post("/api/demo-target/toggle")
def toggle_demo_target_mode():
    import requests
    try:
        url = f"{settings.ICREAM_SHOP_URL.rstrip('/')}/api/mode/toggle"
        res = requests.post(url, timeout=3)
        return res.json()
    except Exception as e:
        return {"mode": "secure", "fallback": True, "error": str(e)}

@app.on_event("startup")
def seed_initial_demo_data():
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(User).filter(User.email == "analyst@vulnscan.sec").first()
        if not user:
            user = User(
                email="analyst@vulnscan.sec",
                hashed_password=hashlib.sha256("vulnscan2026".encode()).hexdigest(),
                full_name="Lead Security Architect",
                role="admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Check if iCream Shop demo project exists
        demo_proj = db.query(Project).filter(Project.name == "iCream Shop (Demonstration Target)").first()
        if not demo_proj:
            demo_proj = Project(
                user_id=user.id,
                name="iCream Shop (Demonstration Target)",
                description="Primary artisan ice cream e-commerce demonstration application featuring intentional vulnerabilities in lab mode.",
                project_type="localhost",
                target_url=settings.ICREAM_SHOP_URL,
                source_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "../../icream-shop")),
                tech_stack=["Python 3.10", "FastAPI", "SQLite", "HTML5", "REST API"],
                security_score=45
            )
            db.add(demo_proj)
            db.commit()
            db.refresh(demo_proj)

            # Trigger an initial scan so the dashboard immediately has live data to display!
            initial_scan = ScanJob(
                project_id=demo_proj.id,
                scan_type="comprehensive",
                status="PENDING",
                current_stage="Queued",
                progress_percent=0,
                enable_sast=True,
                enable_dast=True,
                enable_sca=True,
                enable_secrets=True,
                enable_infrastructure=True,
                enable_api_security=True,
                target_scope=settings.ICREAM_SHOP_URL
            )
            db.add(initial_scan)
            db.commit()
            db.refresh(initial_scan)

            ScanOrchestrator.execute_scan(db, initial_scan.id)
    except Exception as e:
        print(f"Startup seed notice: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

