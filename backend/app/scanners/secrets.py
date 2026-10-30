import os
import re
from typing import List, Dict, Any

class SecretScanner:
    """
    Secret Detection Engine (inspired by Gitleaks pattern sets).
    Identifies hardcoded API tokens, private keys, database passwords, JWT secrets, Supabase keys.
    """

    SECRET_PATTERNS = [
        {
            "name": "Supabase Public / Anon API Key",
            "regex": r"""\b(sb_publishable_[a-zA-Z0-9_\-]{20,})\b""",
            "severity": "MEDIUM",
            "cwe": "CWE-798"
        },
        {
            "name": "Supabase Service Role Secret Key",
            "regex": r"""\b(sb_secret_[a-zA-Z0-9_\-]{20,})\b""",
            "severity": "CRITICAL",
            "cwe": "CWE-798"
        },
        {
            "name": "Hardcoded Supabase Project URL & Anon Key Constant",
            "regex": r"""(?:supabaseAnonKey|supabaseKey|NEXT_PUBLIC_SUPABASE_ANON_KEY)\s*=\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]""",
            "severity": "HIGH",
            "cwe": "CWE-798"
        },
        {
            "name": "AWS Access Key ID",
            "regex": r"""\b(AKIA[0-9A-Z]{16})\b""",
            "severity": "CRITICAL",
            "cwe": "CWE-798"
        },
        {
            "name": "Hardcoded JWT Secret / Token Key",
            "regex": r"""(?:jwt_secret|jwt_key|secret_key|app_secret|NEXTAUTH_SECRET)\s*=\s*['"]([a-zA-Z0-9_\-!@#$%^&*]{8,})['"]""",
            "severity": "HIGH",
            "cwe": "CWE-798"
        },
        {
            "name": "Generic Hardcoded Password in Connection String",
            "regex": r"""(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[a-zA-Z0-9_\-]+:([a-zA-Z0-9_\-!@#$%^&*]+)@""",
            "severity": "CRITICAL",
            "cwe": "CWE-259"
        },
        {
            "name": "GitHub Personal Access Token",
            "regex": r"""\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b""",
            "severity": "CRITICAL",
            "cwe": "CWE-798"
        },
        {
            "name": "Stripe Live API Key",
            "regex": r"""\b(sk_live_[a-zA-Z0-9]{24,}|rk_live_[a-zA-Z0-9]{24,})\b""",
            "severity": "CRITICAL",
            "cwe": "CWE-798"
        },
        {
            "name": "OpenAI / Anthropic API Key",
            "regex": r"""\b(sk-[a-zA-Z0-9]{32,}|sk-ant-[a-zA-Z0-9_\-]{32,})\b""",
            "severity": "CRITICAL",
            "cwe": "CWE-798"
        },
        {
            "name": "Private RSA / SSH Key Block",
            "regex": r"""-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----""",
            "severity": "CRITICAL",
            "cwe": "CWE-312"
        }
    ]

    @classmethod
    def scan_directory(cls, directory_path: str) -> List[Dict[str, Any]]:
        findings = []
        if not os.path.exists(directory_path):
            return findings

        excluded_dirs = {".git", "node_modules", "venv", ".venv", "__pycache__", "dist", ".next", "build"}

        for root, dirs, files in os.walk(directory_path):
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
            for file in files:
                if file.endswith((".py", ".js", ".ts", ".jsx", ".tsx", ".env", ".env.local", ".env.example", ".json", ".yml", ".yaml", ".ini", ".conf", ".pem", ".sql")):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, directory_path)
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            lines = f.readlines()

                        for line_idx, line in enumerate(lines, start=1):
                            for pattern in cls.SECRET_PATTERNS:
                                match = re.search(pattern["regex"], line, re.IGNORECASE)
                                if match:
                                    matched_val = match.group(0)
                                    masked = matched_val[:4] + "*" * (max(4, len(matched_val) - 8)) + matched_val[-4:] if len(matched_val) > 8 else "***REDACTED***"

                                    findings.append({
                                        "title": f"Exposed Secret: {pattern['name']}",
                                        "category": "Hardcoded Secrets",
                                        "severity": pattern["severity"],
                                        "confidence": "HIGH",
                                        "detection_source": "SECRETS",
                                        "cwe": pattern["cwe"],
                                        "cve": "",
                                        "file_path": rel_path,
                                        "line_number": line_idx,
                                        "evidence": line.strip().replace(match.group(0), masked),
                                        "description": f"Hardcoded secret detected matching pattern: {pattern['name']}.",
                                        "technical_explanation": "Credentials committed directly to source control can be discovered by unauthorized parties or extracted from client bundles.",
                                        "potential_impact": "Full API service compromise, unauthorized database access, cloud account takeover.",
                                        "original_code": line.strip(),
                                        "suggested_code": f"# Load from environment variable\nimport os\nSECRET = os.getenv('{pattern['name'].replace(' ', '_').upper()}')",
                                        "recommended_solution": "Remove credential from source code immediately, revoke/rotate the compromised secret, and use environment variables or a Secret Manager."
                                    })
                                    break
                    except Exception as e:
                        print(f"Error scanning secrets in {file_path}: {e}")
        return findings
