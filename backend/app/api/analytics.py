from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, ScanJob, Vulnerability

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    total_scans = db.query(ScanJob).count()
    
    critical_vulns = db.query(Vulnerability).filter(Vulnerability.severity == "CRITICAL", Vulnerability.status == "OPEN").count()
    high_vulns = db.query(Vulnerability).filter(Vulnerability.severity == "HIGH", Vulnerability.status == "OPEN").count()
    fixed_vulns = db.query(Vulnerability).filter(Vulnerability.status == "FIXED").count()
    total_vulns = db.query(Vulnerability).count()

    projects = db.query(Project).all()
    avg_score = int(sum(p.security_score for p in projects) / len(projects)) if projects else 100

    return {
        "total_projects": total_projects,
        "total_scans": total_scans,
        "critical_vulnerabilities": critical_vulns,
        "high_vulnerabilities": high_vulns,
        "fixed_vulnerabilities": fixed_vulns,
        "total_vulnerabilities": total_vulns,
        "average_security_score": avg_score
    }

@router.get("/severity")
def get_severity_distribution(db: Session = Depends(get_db)):
    vulns = db.query(Vulnerability).all()
    counts = Counter(v.severity.upper() for v in vulns)
    return [
        {"name": "Critical", "value": counts.get("CRITICAL", 0), "color": "#ef4444"},
        {"name": "High", "value": counts.get("HIGH", 0), "color": "#f97316"},
        {"name": "Medium", "value": counts.get("MEDIUM", 0), "color": "#f59e0b"},
        {"name": "Low", "value": counts.get("LOW", 0), "color": "#0ea5e9"},
        {"name": "Informational", "value": counts.get("INFO", 0), "color": "#64748b"}
    ]

@router.get("/categories")
def get_category_distribution(db: Session = Depends(get_db)):
    vulns = db.query(Vulnerability).all()
    counts = Counter(v.category for v in vulns)
    return [
        {"category": cat, "count": count}
        for cat, count in counts.most_common(8)
    ]

@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    # Group recent scans
    scans = db.query(ScanJob).order_by(ScanJob.id.asc()).limit(10).all()
    data = []
    for s in scans:
        data.append({
            "scan": f"Scan #{s.id}",
            "critical": s.critical_count,
            "high": s.high_count,
            "medium": s.medium_count,
            "total": s.findings_count,
            "fixed": s.fixed_count
        })
    if not data:
        data = [
            {"scan": "Baseline", "critical": 0, "high": 0, "medium": 0, "total": 0, "fixed": 0}
        ]
    return data

