import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Security Analyst")
    role = Column(String(50), default="analyst") # admin, analyst, developer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    projects = relationship("Project", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    project_type = Column(String(50), nullable=False) # localhost, live_url, github, upload
    target_url = Column(String(500), default="")
    repo_branch = Column(String(100), default="main")
    source_path = Column(String(500), default="")
    tech_stack = Column(JSON, default=list) # ["Python", "FastAPI", "PostgreSQL", "React"]
    security_score = Column(Integer, default=100) # 0-100
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    scans = relationship("ScanJob", back_populates="project", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="project", cascade="all, delete-orphan")
    pipelines = relationship("CiCdPipeline", back_populates="project", cascade="all, delete-orphan")


class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    scan_type = Column(String(50), default="comprehensive") # quick, standard, comprehensive, sast_only, dast_only
    status = Column(String(50), default="PENDING") # PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
    current_stage = Column(String(100), default="Initialized")
    progress_percent = Column(Integer, default=0)
    
    # Selected modules
    enable_sast = Column(Boolean, default=True)
    enable_dast = Column(Boolean, default=True)
    enable_sca = Column(Boolean, default=True)
    enable_secrets = Column(Boolean, default=True)
    enable_infrastructure = Column(Boolean, default=True)
    enable_api_security = Column(Boolean, default=True)
    
    # Counters
    files_scanned = Column(Integer, default=0)
    endpoints_discovered = Column(Integer, default=0)
    dependencies_analysed = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)
    
    # Severity breakdown
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)
    fixed_count = Column(Integer, default=0)
    
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    target_scope = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="scans")
    logs = relationship("ScanLog", back_populates="scan", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="scan", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="scan", cascade="all, delete-orphan")


class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scan_jobs.id"), nullable=False)
    stage = Column(String(100), default="General")
    level = Column(String(20), default="INFO") # INFO, WARNING, ERROR, SUCCESS
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("ScanJob", back_populates="logs")


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scan_jobs.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # SQL Injection, XSS, IDOR, etc.
    severity = Column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence = Column(String(20), default="HIGH") # HIGH, MEDIUM, LOW
    status = Column(String(30), default="OPEN") # OPEN, CONFIRMED, FIXED, FALSE_POSITIVE, ACCEPTED_RISK
    
    detection_source = Column(String(50), default="SAST") # SAST, DAST, SCA, SECRETS, INFRASTRUCTURE
    cwe = Column(String(50), default="CWE-89")
    cve = Column(String(50), default="")
    
    file_path = Column(String(500), default="")
    line_number = Column(Integer, nullable=True)
    endpoint = Column(String(500), default="")
    http_method = Column(String(10), default="GET")
    param_name = Column(String(100), default="")
    
    description = Column(Text, default="")
    technical_explanation = Column(Text, default="")
    potential_impact = Column(Text, default="")
    evidence = Column(Text, default="")
    
    original_code = Column(Text, default="")
    suggested_code = Column(Text, default="")
    recommended_solution = Column(Text, default="")
    
    remediation_notes = Column(Text, default="")
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    scan = relationship("ScanJob", back_populates="vulnerabilities")
    project = relationship("Project", back_populates="vulnerabilities")
    validations = relationship("ValidationResult", back_populates="vulnerability", cascade="all, delete-orphan")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True)
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"), nullable=False)
    test_type = Column(String(100), nullable=False) # Controlled SQLi, Reflected XSS, IDOR Boundary, etc.
    status = Column(String(30), default="PENDING") # CONFIRMED, NOT_REPRODUCED, INCONCLUSIVE
    target_tested = Column(String(500), default="")
    payload_used = Column(Text, default="")
    response_evidence = Column(Text, default="")
    timeline_notes = Column(Text, default="")
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)

    vulnerability = relationship("Vulnerability", back_populates="validations")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scan_jobs.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), default="FULL") # FULL, EXECUTIVE, VULNERABILITY
    format = Column(String(10), default="PDF") # PDF, JSON, CSV
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scan = relationship("ScanJob", back_populates="reports")


class CiCdPipeline(Base):
    __tablename__ = "cicd_pipelines"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    branch = Column(String(100), default="main")
    commit_hash = Column(String(64), default="a1b2c3d4")
    author = Column(String(100), default="Developer")
    policy = Column(String(30), default="STRICT") # STRICT, BALANCED, MONITOR
    gate_status = Column(String(20), default="PASS") # PASS, FAIL
    block_reason = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="pipelines")

