import os
import hashlib
from app.database import engine, Base, SessionLocal
from app.models import User, Project, ScanJob, Vulnerability
from app.scanners.orchestrator import ScanOrchestrator

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
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

        demo_proj = db.query(Project).filter(Project.name == "iCream Shop (Demonstration Target)").first()
        if not demo_proj:
            demo_proj = Project(
                user_id=user.id,
                name="iCream Shop (Demonstration Target)",
                description="Primary artisan ice cream e-commerce demonstration application featuring intentional vulnerabilities in lab mode.",
                project_type="localhost",
                target_url="http://127.0.0.1:8001",
                source_path=os.path.abspath(os.path.join(os.path.dirname(__file__), "../icream-shop")),
                tech_stack=["Python 3.10", "FastAPI", "SQLite", "HTML5", "REST API"],
                security_score=45
            )
            db.add(demo_proj)
            db.commit()
            db.refresh(demo_proj)

            print(f"Created Project: {demo_proj.name} (#{demo_proj.id})")

            # Create initial scan
            scan = ScanJob(
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
                target_scope="http://127.0.0.1:8001"
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)

            print(f"Executing initial scan #{scan.id}...")
            ScanOrchestrator.execute_scan(db, scan.id)
            print("Scan execution completed successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()

