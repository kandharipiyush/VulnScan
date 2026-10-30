import os
import io
import csv
import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Report, ScanJob, Project, Vulnerability
from app.reports.pdf_generator import SecurityReportGenerator
from app.config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
def list_reports(project_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if project_id:
        query = query.filter(Report.project_id == project_id)
    return query.order_by(Report.id.desc()).all()

@router.post("/generate")
def trigger_report_generation(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(ScanJob).filter(ScanJob.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    project = db.query(Project).filter(Project.id == scan.project_id).first()

    vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == scan.id).all()
    vuln_dict_list = [
        {
            "title": v.title,
            "category": v.category,
            "severity": v.severity,
            "cwe": v.cwe,
            "cve": v.cve,
            "file_path": v.file_path,
            "line_number": v.line_number,
            "endpoint": v.endpoint,
            "detection_source": v.detection_source,
            "evidence": v.evidence,
            "technical_explanation": v.technical_explanation,
            "recommended_solution": v.recommended_solution
        }
        for v in vulns
    ]

    reports_dir = os.path.abspath(settings.REPORTS_DIR)
    os.makedirs(reports_dir, exist_ok=True)
    report_pdf_name = f"VulnScan_Report_Project_{project.id}_Scan_{scan.id}.pdf"
    report_pdf_path = os.path.join(reports_dir, report_pdf_name)

    proj_data = {"id": project.id, "name": project.name, "target_url": project.target_url, "source_path": project.source_path, "security_score": project.security_score}
    scan_data = {
        "id": scan.id,
        "scan_type": scan.scan_type,
        "critical_count": scan.critical_count,
        "high_count": scan.high_count,
        "medium_count": scan.medium_count,
        "low_count": scan.low_count,
        "info_count": scan.info_count,
        "fixed_count": scan.fixed_count
    }

    SecurityReportGenerator.generate_pdf(proj_data, scan_data, vuln_dict_list, report_pdf_path)

    report = Report(
        scan_id=scan.id,
        project_id=project.id,
        title=f"Security Assessment Report - {project.name}",
        report_type="FULL",
        format="PDF",
        file_path=report_pdf_path,
        file_size_bytes=os.path.getsize(report_pdf_path) if os.path.exists(report_pdf_path) else 0
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {"status": "success", "report_id": report.id, "file_path": report_pdf_path}

@router.get("/{id}/download")
def download_report(id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(report.file_path, filename=os.path.basename(report.file_path), media_type="application/pdf")

@router.get("/export/json")
def export_scan_json(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(ScanJob).filter(ScanJob.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == scan.id).all()
    data = {
        "scan_id": scan.id,
        "project_id": scan.project_id,
        "created_at": str(scan.created_at),
        "total_findings": len(vulns),
        "vulnerabilities": [
            {
                "id": v.id,
                "title": v.title,
                "category": v.category,
                "severity": v.severity,
                "cwe": v.cwe,
                "file_path": v.file_path,
                "line_number": v.line_number,
                "endpoint": v.endpoint,
                "status": v.status,
                "evidence": v.evidence,
                "recommended_solution": v.recommended_solution
            }
            for v in vulns
        ]
    }
    return Response(content=json.dumps(data, indent=2), media_type="application/json", headers={"Content-Disposition": f"attachment; filename=scan_{scan_id}_findings.json"})

@router.get("/export/csv")
def export_scan_csv(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(ScanJob).filter(ScanJob.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    vulns = db.query(Vulnerability).filter(Vulnerability.scan_id == scan.id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Category", "Severity", "CWE", "Source", "File/Endpoint", "Line", "Status"])
    for v in vulns:
        writer.writerow([v.id, v.title, v.category, v.severity, v.cwe, v.detection_source, v.file_path or v.endpoint, v.line_number or "", v.status])

    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=scan_{scan_id}_findings.csv"})

