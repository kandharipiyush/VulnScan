from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, ScanJob, Vulnerability
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    res = []
    for p in projects:
        total_f = db.query(Vulnerability).filter(Vulnerability.project_id == p.id, Vulnerability.status == "OPEN").count()
        crit_f = db.query(Vulnerability).filter(Vulnerability.project_id == p.id, Vulnerability.severity == "CRITICAL", Vulnerability.status == "OPEN").count()
        high_f = db.query(Vulnerability).filter(Vulnerability.project_id == p.id, Vulnerability.severity == "HIGH", Vulnerability.status == "OPEN").count()

        p_dict = {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "project_type": p.project_type,
            "target_url": p.target_url,
            "repo_branch": p.repo_branch,
            "source_path": p.source_path,
            "tech_stack": p.tech_stack or [],
            "security_score": p.security_score,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "total_findings": total_f,
            "critical_findings": crit_f,
            "high_findings": high_f
        }
        res.append(p_dict)
    return res

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    new_proj = Project(
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        target_url=project_in.target_url,
        repo_branch=project_in.repo_branch,
        source_path=project_in.source_path,
        tech_stack=project_in.tech_stack or ["Python", "FastAPI"]
    )
    db.add(new_proj)
    db.commit()
    db.refresh(new_proj)

    return {
        "id": new_proj.id,
        "name": new_proj.name,
        "description": new_proj.description,
        "project_type": new_proj.project_type,
        "target_url": new_proj.target_url,
        "repo_branch": new_proj.repo_branch,
        "source_path": new_proj.source_path,
        "tech_stack": new_proj.tech_stack,
        "security_score": new_proj.security_score,
        "created_at": new_proj.created_at,
        "updated_at": new_proj.updated_at,
        "total_findings": 0,
        "critical_findings": 0,
        "high_findings": 0
    }

@router.get("/{id}", response_model=ProjectResponse)
def get_project(id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    total_f = db.query(Vulnerability).filter(Vulnerability.project_id == p.id, Vulnerability.status == "OPEN").count()
    crit_f = db.query(Vulnerability).filter(Vulnerability.project_id == p.id, Vulnerability.severity == "CRITICAL", Vulnerability.status == "OPEN").count()
    high_f = db.query(Vulnerability).filter(Vulnerability.project_id == p.id, Vulnerability.severity == "HIGH", Vulnerability.status == "OPEN").count()

    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "project_type": p.project_type,
        "target_url": p.target_url,
        "repo_branch": p.repo_branch,
        "source_path": p.source_path,
        "tech_stack": p.tech_stack or [],
        "security_score": p.security_score,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "total_findings": total_f,
        "critical_findings": crit_f,
        "high_findings": high_f
    }

@router.delete("/{id}")
def delete_project(id: int, db: Session = Depends(get_db)):
    p = db.query(Project).filter(Project.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(p)
    db.commit()
    return {"status": "success", "message": f"Project #{id} deleted"}

