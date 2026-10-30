import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel

# Auth Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str = "Security Analyst"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Project Schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    project_type: str # localhost, live_url, github, upload
    target_url: Optional[str] = ""
    repo_branch: Optional[str] = "main"
    source_path: Optional[str] = ""
    tech_stack: Optional[List[str]] = []

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_url: Optional[str] = None
    repo_branch: Optional[str] = None
    tech_stack: Optional[List[str]] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    project_type: str
    target_url: Optional[str]
    repo_branch: Optional[str]
    source_path: Optional[str]
    tech_stack: Optional[List[str]]
    security_score: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    total_findings: Optional[int] = 0
    critical_findings: Optional[int] = 0
    high_findings: Optional[int] = 0

    class Config:
        from_attributes = True

# Scan Schemas
class ScanCreate(BaseModel):
    project_id: Optional[int] = None
    target_url: Optional[str] = ""
    project_name: Optional[str] = ""
    project_type: Optional[str] = "github"
    scan_type: str = "comprehensive" # quick, standard, comprehensive
    enable_sast: bool = True
    enable_dast: bool = True
    enable_sca: bool = True
    enable_secrets: bool = True
    enable_infrastructure: bool = True
    enable_api_security: bool = True
    target_scope: Optional[str] = ""
    confirmed_authorization: bool = True

class ScanResponse(BaseModel):
    id: int
    project_id: int
    scan_type: str
    status: str
    current_stage: str
    progress_percent: int
    files_scanned: int
    endpoints_discovered: int
    dependencies_analysed: int
    findings_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    info_count: int
    fixed_count: int
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ScanLogResponse(BaseModel):
    id: int
    scan_id: int
    stage: str
    level: str
    message: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Vulnerability Schemas
class VulnerabilityResponse(BaseModel):
    id: int
    scan_id: int
    project_id: int
    title: str
    category: str
    severity: str
    confidence: str
    status: str
    detection_source: str
    cwe: Optional[str]
    cve: Optional[str]
    file_path: Optional[str]
    line_number: Optional[int]
    endpoint: Optional[str]
    http_method: Optional[str]
    param_name: Optional[str]
    description: Optional[str]
    technical_explanation: Optional[str]
    potential_impact: Optional[str]
    evidence: Optional[str]
    original_code: Optional[str]
    suggested_code: Optional[str]
    recommended_solution: Optional[str]
    verified_at: Optional[datetime.datetime]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class VulnerabilityStatusUpdate(BaseModel):
    status: str # OPEN, CONFIRMED, FIXED, FALSE_POSITIVE, ACCEPTED_RISK
    remediation_notes: Optional[str] = ""

# Security Validation Lab Schemas
class ValidationRequest(BaseModel):
    vulnerability_id: int
    confirmed_authorization: bool = True
    test_mode: str = "NON_DESTRUCTIVE"

class ValidationResponse(BaseModel):
    id: int
    vulnerability_id: int
    test_type: str
    status: str
    target_tested: str
    payload_used: str
    response_evidence: str
    timeline_notes: str
    executed_at: datetime.datetime

    class Config:
        from_attributes = True

# AI Assistant Schemas
class AIChatRequest(BaseModel):
    message: str
    project_id: Optional[int] = None
    vulnerability_id: Optional[int] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_patch: Optional[str] = None
    references: Optional[List[str]] = None

class AIFixRequest(BaseModel):
    vulnerability_id: int

class AIFixResponse(BaseModel):
    vulnerability_id: int
    title: str
    file_path: Optional[str]
    original_code: str
    suggested_code: str
    explanation: str
    risk_reduction: str

# CI/CD Schemas
class CiCdTriggerRequest(BaseModel):
    project_id: int
    branch: str = "main"
    commit_hash: str = "HEAD"
    policy: str = "STRICT" # STRICT, BALANCED, MONITOR

class CiCdGateResponse(BaseModel):
    id: int
    project_id: int
    gate_status: str # PASS, FAIL
    policy: str
    block_reason: str
    findings_summary: Dict[str, int]
    created_at: datetime.datetime

    class Config:
        from_attributes = True
