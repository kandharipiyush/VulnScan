import os
import re
from typing import List, Dict, Any

class SASTScanner:
    """
    Static Application Security Testing Engine.
    Inspects source code (Python, JS/TS, React, Next.js, SQL, Configs)
    for dangerous functions, unescaped DOM sinks, unsafe SQL, and configuration errors.
    """

    PATTERNS = [
        {
            "category": "SQL Injection (SQLi)",
            "title": "Unsafe SQL Query Construction via String Formatting",
            "cwe": "CWE-89",
            "cve": "CVE-2024-SQLI-01",
            "severity": "CRITICAL",
            "confidence": "HIGH",
            "regex": [
                r"""(?:execute|cursor\.execute|raw|query)\s*\(\s*f?["'].*?(?:SELECT|INSERT|UPDATE|DELETE).*?["']\s*(\+|\%)\s*""",
                r"""(?:execute|cursor\.execute)\s*\(\s*f["'].*?\{[a-zA-Z0-9_]+\}.*?["']\s*\)""",
                r"""SELECT\s+.*?\s+FROM\s+.*?\s+WHERE\s+.*?=\s*['"]\s*\+\s*[a-zA-Z0-9_]+""",
                r"""db\.query\(["'].*?\$\{.*?\}""",
                r"""prisma\.\$queryRawUnsafe\(.*?[\$\+]"""
            ],
            "description": "The application dynamically concatenates user-controlled input directly into an SQL command without parameterization.",
            "technical_explanation": "When untrusted variables are interpolated directly into SQL syntax, an attacker can manipulate query logic, bypass authentication, and access or dump sensitive database tables.",
            "potential_impact": "Unauthorized database read/write access, administrative privilege escalation, complete data breach.",
            "recommended_solution": "Use parameterized queries or ORM prepared statements instead of raw string concatenation.",
            "vulnerable_example": 'cursor.execute(f"SELECT * FROM users WHERE username = \'{username}\'")',
            "secure_example": 'cursor.execute("SELECT * FROM users WHERE username = %s", (username,))'
        },
        {
            "category": "Cross-Site Scripting (XSS)",
            "title": "DOM XSS / Unescaped HTML Output via dangerouslySetInnerHTML",
            "cwe": "CWE-79",
            "cve": "CVE-2024-XSS-02",
            "severity": "HIGH",
            "confidence": "HIGH",
            "regex": [
                r"""dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:""",
                r"""(?:innerHTML|outerHTML)\s*=\s*[a-zA-Z0-9_\.]+""",
                r"""render_template_string\s*\(.*?[\+\%].*?\)""",
                r"""res\.(?:send|write)\s*\(\s*["'].*?<.*?\$\{.*?\}.*?["']\s*\)""",
                r"""document\.write\s*\("""
            ],
            "description": "Direct insertion of unescaped HTML or using dangerouslySetInnerHTML can introduce Cross-Site Scripting vulnerabilities.",
            "technical_explanation": "Untrusted input embedded directly in web page templates allows malicious JavaScript to execute in victims' browsers.",
            "potential_impact": "Session hijacking via cookie theft, credential harvesting, malicious redirects, and DOM defacement.",
            "recommended_solution": "Use automatic contextual HTML escaping, sanitization libraries (DOMPurify), and Content Security Policy (CSP).",
            "vulnerable_example": '<div dangerouslySetInnerHTML={{ __html: userContent }} />',
            "secure_example": '<div>{userContent}</div> // or DOMPurify.sanitize(userContent)'
        },
        {
            "category": "Command Injection / Remote Code Execution",
            "title": "Dynamic Code Evaluation via eval() or Function Constructor",
            "cwe": "CWE-95",
            "cve": "CVE-2024-EVAL-03",
            "severity": "CRITICAL",
            "confidence": "HIGH",
            "regex": [
                r"""\beval\s*\([a-zA-Z0-9_\.]+\)""",
                r"""new\s+Function\s*\(.*?[a-zA-Z0-9_\.]+\)""",
                r"""os\.system\s*\(\s*f?["'].*?[\+\%\{].*?\)""",
                r"""subprocess\.(?:call|run|Popen)\s*\(.*?(?:shell=True).*?\)"""
            ],
            "description": "Dynamic execution of code using eval() or Function constructor from dynamic inputs.",
            "technical_explanation": "Evaluating dynamic text strings allows untrusted input to execute arbitrary commands or server code.",
            "potential_impact": "Arbitrary code execution on client or server.",
            "recommended_solution": "Avoid eval() and dynamic Function creation. Use structured JSON.parse or strict parsers.",
            "vulnerable_example": 'eval(dynamicInput);',
            "secure_example": 'JSON.parse(dynamicInput);'
        },
        {
            "category": "Broken Access Control / IDOR",
            "title": "Insecure Direct Object Reference (IDOR) / Missing Ownership Check",
            "cwe": "CWE-639",
            "cve": "CVE-2024-IDOR-04",
            "severity": "HIGH",
            "confidence": "MEDIUM",
            "regex": [
                r"""SELECT\s+\*\s+FROM\s+(?:users|profiles|orders|accounts)\s+WHERE\s+id\s*=\s*(?:\%s|\?|\:id)[^;]*(?:(?!AND\s+user_id).)*$""",
                r"""\.from\(["']projects["']\)\.select\(["']\*["']\)\.order\(["']group_number["']""",
                r"""db\.query\(User\)\.filter\(User\.id\s*==\s*user_id\)\.first\(\)"""
            ],
            "description": "Resource access query relies strictly on client-supplied ID without verifying ownership or Row Level Security.",
            "technical_explanation": "Missing authorization check allows any user to view or modify records belonging to other users.",
            "potential_impact": "Unauthorized exposure of confidential student/user records, project profiles, and private data.",
            "recommended_solution": "Enforce Supabase Row Level Security (RLS) policies and filter records by authenticated session user id.",
            "vulnerable_example": 'const { data } = await supabase.from("projects").select("*");',
            "secure_example": 'const { data } = await supabase.from("projects").select("*").eq("user_id", session.user.id);'
        },
        {
            "category": "Open Redirect",
            "title": "Unvalidated URL Redirection in Web Handlers",
            "cwe": "CWE-601",
            "cve": "CVE-2024-REDIR-05",
            "severity": "MEDIUM",
            "confidence": "HIGH",
            "regex": [
                r"""NextResponse\.redirect\s*\(\s*(?:url|req\.query|searchParams\.get)""",
                r"""res\.redirect\s*\(\s*(?:req\.query|req\.body\.)"""
            ],
            "description": "User input directly governs the destination target in server redirect response.",
            "technical_explanation": "Attackers can supply external URLs (e.g., https://attacker.com) to redirect users to malicious phishing pages.",
            "potential_impact": "Phishing credential harvesting and reputation damage.",
            "recommended_solution": "Validate redirect destinations against a strict internal route whitelist.",
            "vulnerable_example": 'return NextResponse.redirect(searchParams.get("returnUrl"));',
            "secure_example": 'const safeUrl = sanitizeInternalRedirect(searchParams.get("returnUrl"));'
        },
        {
            "category": "Security Misconfiguration",
            "title": "Debug Mode or Permissive Wildcard CORS Active",
            "cwe": "CWE-489",
            "cve": "CVE-2024-MISC-06",
            "severity": "MEDIUM",
            "confidence": "HIGH",
            "regex": [
                r"""(?:DEBUG|debug)\s*=\s*True""",
                r"""app\.run\(.*?debug=True.*?\)""",
                r"""allow_origins=\["\*"\]""",
                r"""origin:\s*["']\*["']"""
            ],
            "description": "Debug mode or overly permissive CORS policy is active in settings.",
            "technical_explanation": "Permissive configurations leak diagnostic information or allow arbitrary external domains to invoke APIs.",
            "potential_impact": "Information disclosure and cross-origin data exposure.",
            "recommended_solution": "Disable debug mode in production and restrict allowed CORS domains.",
            "vulnerable_example": 'origin: "*"',
            "secure_example": 'origin: ["https://app.yourdomain.com"]'
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
                if file.endswith((".py", ".js", ".ts", ".jsx", ".tsx", ".php", ".go", ".java", ".json", ".env", ".sql")):
                    file_full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_full_path, directory_path)
                    try:
                        with open(file_full_path, "r", encoding="utf-8", errors="ignore") as f:
                            lines = f.readlines()
                            content = "".join(lines)

                        for pattern in cls.PATTERNS:
                            for reg in pattern["regex"]:
                                match = re.search(reg, content, re.MULTILINE | re.IGNORECASE)
                                if match:
                                    match_pos = match.start()
                                    line_num = content[:match_pos].count("\n") + 1
                                    evidence_line = lines[line_num - 1].strip() if line_num <= len(lines) else match.group(0)

                                    findings.append({
                                        "title": pattern["title"],
                                        "category": pattern["category"],
                                        "severity": pattern["severity"],
                                        "confidence": pattern["confidence"],
                                        "detection_source": "SAST",
                                        "cwe": pattern["cwe"],
                                        "cve": pattern["cve"],
                                        "file_path": rel_path,
                                        "line_number": line_num,
                                        "evidence": evidence_line,
                                        "description": pattern["description"],
                                        "technical_explanation": pattern["technical_explanation"],
                                        "potential_impact": pattern["potential_impact"],
                                        "original_code": evidence_line,
                                        "suggested_code": pattern.get("secure_example", ""),
                                        "recommended_solution": pattern["recommended_solution"]
                                    })
                                    break
                    except Exception as e:
                        print(f"Error scanning {file_full_path}: {e}")
        return findings
