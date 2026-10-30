from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CiCdPipeline, Project, Vulnerability
from app.schemas import CiCdTriggerRequest, CiCdGateResponse

router = APIRouter(prefix="/cicd", tags=["CI/CD DevSecOps"])

@router.post("/evaluate", response_model=CiCdGateResponse)
def evaluate_security_gate(req: CiCdTriggerRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    open_vulns = db.query(Vulnerability).filter(Vulnerability.project_id == project.id, Vulnerability.status == "OPEN").all()
    critical_count = sum(1 for v in open_vulns if v.severity == "CRITICAL")
    high_count = sum(1 for v in open_vulns if v.severity == "HIGH")
    medium_count = sum(1 for v in open_vulns if v.severity == "MEDIUM")
    low_count = sum(1 for v in open_vulns if v.severity == "LOW")

    gate_status = "PASS"
    block_reason = "All security policy conditions satisfied. Ready for deployment."

    if req.policy == "STRICT":
        if critical_count > 0 or high_count > 0:
            gate_status = "FAIL"
            block_reason = f"Security Gate Blocked: {critical_count} Critical and {high_count} High vulnerability findings violate Strict Policy."
    elif req.policy == "BALANCED":
        if critical_count > 0:
            gate_status = "FAIL"
            block_reason = f"Security Gate Blocked: {critical_count} Critical vulnerability finding(s) violate Balanced Policy."
    else: # MONITOR
        gate_status = "PASS"
        block_reason = "Monitor Policy active: Findings recorded for tracking, deployment allowed."

    pipeline = CiCdPipeline(
        project_id=project.id,
        branch=req.branch,
        commit_hash=req.commit_hash,
        author="DevOps Engineer",
        policy=req.policy,
        gate_status=gate_status,
        block_reason=block_reason
    )
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)

    return {
        "id": pipeline.id,
        "project_id": project.id,
        "gate_status": gate_status,
        "policy": req.policy,
        "block_reason": block_reason,
        "findings_summary": {
            "critical": critical_count,
            "high": high_count,
            "medium": medium_count,
            "low": low_count
        },
        "created_at": pipeline.created_at
    }

@router.get("/history")
def get_cicd_history(project_id: int = None, db: Session = Depends(get_db)):
    query = db.query(CiCdPipeline)
    if project_id:
        query = query.filter(CiCdPipeline.project_id == project_id)
    return query.order_by(CiCdPipeline.id.desc()).all()

@router.get("/workflow-snippet")
def get_workflow_snippet():
    yaml_snippet = """name: VulnScan DevSecOps Gate

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Run VulnScan Security Gate
        run: |
          curl -X POST "http://localhost:8000/api/cicd/evaluate" \\
            -H "Content-Type: application/json" \\
            -d '{"project_id": 1, "branch": "${{ github.ref_name }}", "commit_hash": "${{ github.sha }}", "policy": "STRICT"}'
"""
    return {"yaml": yaml_snippet}

