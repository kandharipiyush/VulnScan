import os
from typing import Dict, Any, Optional, List
from app.config import settings

class SecurityAIEngine:
    """
    AI-Powered Vulnerability Intelligence Engine.
    Provides context-aware vulnerability explanations, dynamic remediation code patches,
    and interactive security Q&A.
    """

    EXPERT_KNOWLEDGE = {
        "SQL Injection (SQLi)": {
            "root_cause": "The web application constructs SQL queries using direct string concatenation or formatting with untrusted user input.",
            "impact": "Attackers can bypass authentication gates, extract the entire database schema and records (including passwords and credit cards), modify or drop tables, and in some database configurations execute operating system commands.",
            "secure_pattern": "Always bind user inputs using parameterized queries (placeholders such as %s or ?) or use ORM query builders that sanitize parameters automatically.",
            "sample_diff": "- cursor.execute(f'SELECT * FROM users WHERE username = \\'{username}\\'')\n+ cursor.execute('SELECT * FROM users WHERE username = %s', (username,))"
        },
        "Cross-Site Scripting (XSS)": {
            "root_cause": "Untrusted input received via HTTP query, body, or database is reflected into the HTML DOM without contextual entity encoding or sanitization.",
            "impact": "Malicious JavaScript executed in the victim's session can read `document.cookie`, steal session tokens, impersonate users, deface pages, or redirect victims to phishing sites.",
            "secure_pattern": "Encode all user-supplied data using HTML entity encoding before rendering, and implement Content Security Policy (CSP) with nonce-based script execution.",
            "sample_diff": "- return render_template_string(f'<h1>Hello {name}</h1>')\n+ return render_template('hello.html', name=html.escape(name))"
        },
        "Broken Access Control / IDOR": {
            "root_cause": "The server uses a client-provided identifier (e.g. user_id=42) to retrieve private records without validating if the current authenticated user owns that record.",
            "impact": "Any authenticated or unauthenticated attacker can enumerate IDs to harvest records belonging to all other users across the system.",
            "secure_pattern": "Enforce object-level access controls at the data access layer: filter records using the authenticated session's user ID.",
            "sample_diff": "- record = db.query(Profile).filter(Profile.id == requested_id).first()\n+ record = db.query(Profile).filter(Profile.id == requested_id, Profile.user_id == current_user.id).first()"
        },
        "Hardcoded Secrets": {
            "root_cause": "Sensitive API tokens, private cryptographic keys, or database credentials are embedded directly within source files.",
            "impact": "Source code leakage through repositories, client-side bundles, or logs immediately compromises the corresponding backend services or cloud infrastructure.",
            "secure_pattern": "Externalize all credentials into environment variables or a dedicated Secrets Manager (e.g., AWS Secrets Manager, HashiCorp Vault).",
            "sample_diff": "- API_KEY = 'AKIAIOSFODNN7EXAMPLE'\n+ API_KEY = os.getenv('AWS_ACCESS_KEY_ID')"
        },
        "Vulnerable Dependencies": {
            "root_cause": "The project relies on outdated third-party open source packages with published CVE records.",
            "impact": "Known automated exploit scripts can target the disclosed flaws, resulting in remote code execution, denial of service, or authentication bypass.",
            "secure_pattern": "Run regular Software Composition Analysis (SCA) and upgrade packages to versions exceeding the published CVE fix threshold.",
            "sample_diff": "- requests==2.28.0\n+ requests>=2.31.0"
        }
    }

    @classmethod
    def explain_vulnerability(cls, vuln_data: Dict[str, Any]) -> Dict[str, str]:
        category = vuln_data.get("category", "")
        title = vuln_data.get("title", "")
        code = vuln_data.get("original_code", "")

        knowledge = cls.EXPERT_KNOWLEDGE.get(category, {
            "root_cause": f"A potential security flaw classified under {category} was identified in the application logic.",
            "impact": "May lead to unauthorized access, confidentiality breach, or system integrity violations.",
            "secure_pattern": "Apply defensive programming, input validation, and follow the principle of least privilege.",
            "sample_diff": "// Apply validated parameters and sanitization"
        })

        # If Gemini API key is configured, query LLM
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"You are VulnScan AI Security Assistant. Analyze this vulnerability:\n"
                    f"Title: {title}\nCategory: {category}\nCWE: {vuln_data.get('cwe')}\n"
                    f"Evidence / Code: {code}\n"
                    f"Explain:\n1. Why this code is vulnerable\n2. Security impact\n3. Precise code remediation patch"
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    return {
                        "explanation": response.text,
                        "root_cause": knowledge["root_cause"],
                        "remediation": knowledge["secure_pattern"],
                        "diff": knowledge.get("sample_diff", "")
                    }
            except Exception as e:
                print(f"Gemini API request failed, falling back to expert rule engine: {e}")

        # Expert Engine fallback
        explanation = (
            f"### Vulnerability Analysis: {title}\n\n"
            f"**Category:** {category} | **CWE:** {vuln_data.get('cwe', 'N/A')}\n\n"
            f"#### Root Cause\n{knowledge['root_cause']}\n\n"
            f"#### Potential Security Impact\n{knowledge['impact']}\n\n"
            f"#### Recommended Remediation\n{knowledge['secure_pattern']}\n"
        )
        return {
            "explanation": explanation,
            "root_cause": knowledge["root_cause"],
            "remediation": knowledge["secure_pattern"],
            "diff": knowledge.get("sample_diff", "")
        }

    @classmethod
    def generate_fix(cls, vuln_data: Dict[str, Any]) -> Dict[str, str]:
        category = vuln_data.get("category", "")
        original_code = vuln_data.get("original_code", "")
        suggested_code = vuln_data.get("suggested_code", "")

        knowledge = cls.EXPERT_KNOWLEDGE.get(category, {})
        explanation = (
            f"This automated patch replaces insecure dynamic construction with safe, parameterized or "
            f"sanitized patterns according to {vuln_data.get('cwe', 'industry best practices')}."
        )

        return {
            "original_code": original_code or "# Original vulnerable code",
            "suggested_code": suggested_code or knowledge.get("sample_diff", "# Safe replacement code"),
            "explanation": explanation,
            "risk_reduction": "Eliminates direct user injection and enforces strict server-side boundary controls."
        }

    @classmethod
    def chat(cls, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        msg_lower = message.lower()
        
        if "sql" in msg_lower:
            return (
                "**SQL Injection Analysis:**\n\n"
                "SQL Injection occurs when user input is concatenated into query strings without parameterization.\n\n"
                "**Fix Guide:**\n"
                "1. Replace raw query formatting with placeholder bindings (`%s` in PostgreSQL/MySQL or `?` in SQLite).\n"
                "2. Ensure the database driver separates query structure from data values.\n"
                "3. Use ORMs like SQLAlchemy where queries are parameterized by default.\n"
                "Would you like me to generate a secure code diff for your specific login or search query?"
            )
        elif "xss" in msg_lower:
            return (
                "**Cross-Site Scripting (XSS) Analysis:**\n\n"
                "XSS happens when user-controlled data is rendered into the browser DOM without HTML encoding.\n\n"
                "**Fix Guide:**\n"
                "1. Always escape untrusted text using `html.escape()` or your framework's safe templating filters.\n"
                "2. Add `Content-Security-Policy: default-src 'self'` header to prevent execution of unauthorized inline scripts.\n"
                "3. Set `HttpOnly` flag on all session cookies to mitigate cookie theft."
            )
        elif "deployment" in msg_lower or "blocking" in msg_lower or "gate" in msg_lower:
            return (
                "**CI/CD Security Gate Status:**\n\n"
                "Under the **Strict Policy**, deployments are blocked whenever confirmed **CRITICAL** or **HIGH** severity findings remain unaddressed.\n\n"
                "To pass the gate:\n"
                "1. Apply the recommended parameterized query fix for SQLi.\n"
                "2. Verify fix using the Rescan button.\n"
                "3. Once zero critical findings remain open, the pipeline will evaluate to **PASS**."
            )
        else:
            return (
                f"**VulnScan AI Assistant:**\n\n"
                f"I have analyzed your project's security posture. I can help you with:\n"
                f"- Explaining why a specific vulnerability was flagged\n"
                f"- Generating copy-paste secure code patches for SQLi, XSS, IDOR, or secrets\n"
                f"- Verifying if your applied fix will pass the next scan\n"
                f"- Explaining CI/CD security gate thresholds.\n\n"
                f"How would you like to proceed?"
            )

