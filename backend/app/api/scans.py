from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ScanJob, ScanLog, Project
from app.schemas import ScanCreate, ScanResponse, ScanLogResponse
from app.scanners.orchestrator import ScanOrchestrator

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.post("", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
def create_scan(scan_in: ScanCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = None
    target_scope = scan_in.target_scope or scan_in.target_url or ""

    if scan_in.project_id:
        project = db.query(Project).filter(Project.id == scan_in.project_id).first()

    if not project and target_scope:
        project = db.query(Project).filter(
            (Project.target_url == target_scope) | (Project.name == scan_in.project_name)
        ).first()

    if not project:
        proj_name = scan_in.project_name
        if not proj_name:
            if "github.com" in target_scope:
                clean = target_scope.rstrip("/").split("/")[-1].replace(".git", "")
                proj_name = clean or "GitHub Repository"
            elif target_scope:
                clean = target_scope.replace("https://", "").replace("http://", "").split("/")[0]
                proj_name = clean or "Security Target"
            else:
                proj_name = "New Audit Project"

        proj_type = scan_in.project_type or ("github" if "github.com" in target_scope else "localhost" if "localhost" in target_scope or "127.0.0.1" in target_scope else "live_url")

        project = Project(
            name=proj_name,
            description=f"Automated security scan target for {target_scope or proj_name}",
            project_type=proj_type,
            target_url=target_scope,
            security_score=100
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    # If project was selected but target_scope is different, update project target
    if target_scope and project.target_url != target_scope:
        project.target_url = target_scope
        db.commit()

    new_scan = ScanJob(
        project_id=project.id,
        scan_type=scan_in.scan_type,
        status="PENDING",
        current_stage="Queued",
        progress_percent=0,
        enable_sast=scan_in.enable_sast,
        enable_dast=scan_in.enable_dast,
        enable_sca=scan_in.enable_sca,
        enable_secrets=scan_in.enable_secrets,
        enable_infrastructure=scan_in.enable_infrastructure,
        enable_api_security=scan_in.enable_api_security,
        target_scope=target_scope or project.target_url or project.source_path or "Authorized Project"
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    # Execute scan synchronously or via background task
    # To ensure immediate responsiveness for demo while guaranteeing completion, run scan
    background_tasks.add_task(run_scan_job, new_scan.id)

    return new_scan

def run_scan_job(scan_id: int):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        ScanOrchestrator.execute_scan(db, scan_id)
    finally:
        db.close()

@router.get("", response_model=List[ScanResponse])
def list_scans(project_id: int = None, db: Session = Depends(get_db)):
    query = db.query(ScanJob)
    if project_id:
        query = query.filter(ScanJob.project_id == project_id)
    return query.order_by(ScanJob.id.desc()).all()

@router.get("/{id}", response_model=ScanResponse)
def get_scan(id: int, db: Session = Depends(get_db)):
    scan = db.query(ScanJob).filter(ScanJob.id == id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan job not found")
    return scan

@router.get("/{id}/logs", response_model=List[ScanLogResponse])
def get_scan_logs(id: int, db: Session = Depends(get_db)):
    logs = db.query(ScanLog).filter(ScanLog.scan_id == id).order_by(ScanLog.id.asc()).all()
    return logs

@router.post("/{id}/cancel")
def cancel_scan(id: int, db: Session = Depends(get_db)):
    scan = db.query(ScanJob).filter(ScanJob.id == id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan job not found")
    scan.status = "CANCELLED"
    scan.current_stage = "Aborted by user"
    db.commit()
    return {"status": "success", "message": f"Scan #{id} marked as cancelled"}

