from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Vulnerability, Project
from app.schemas import AIChatRequest, AIChatResponse
from app.ai.security_ai import SecurityAIEngine

router = APIRouter(prefix="/assistant", tags=["AI Security Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_assistant(req: AIChatRequest, db: Session = Depends(get_db)):
    context = {}
    if req.vulnerability_id:
        v = db.query(Vulnerability).filter(Vulnerability.id == req.vulnerability_id).first()
        if v:
            context["vuln"] = {
                "title": v.title,
                "category": v.category,
                "severity": v.severity,
                "cwe": v.cwe,
                "file_path": v.file_path,
                "original_code": v.original_code,
                "suggested_code": v.suggested_code
            }

    reply = SecurityAIEngine.chat(req.message, context)
    return {
        "reply": reply,
        "suggested_patch": context.get("vuln", {}).get("suggested_code"),
        "references": ["OWASP Top 10 (2021)", "CWE-89", "NIST SP 800-53"]
    }

