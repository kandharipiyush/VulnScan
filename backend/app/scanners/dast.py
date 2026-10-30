import time
import urllib.parse
from typing import List, Dict, Any
import requests

class DASTScanner:
    """
    Dynamic Application Security Testing (DAST) Engine.
    Crawls running web applications (localhost or live URL) and executes
    controlled, non-destructive security probes.
    """

    COMMON_PATHS = [
        "/",
        "/login",
        "/api/login",
        "/search?q=icecream",
        "/api/search?q=test",
        "/products",
        "/api/products",
        "/profile?id=1",
        "/api/profile?id=1",
        "/admin",
        "/api/admin",
        "/reviews",
        "/api/reviews",
        "/cart",
        "/api/users"
    ]

    SQLI_ERROR_SIGNATURES = [
        "sql syntax",
        "unclosed quotation mark",
        "sqlite3.operationalerror",
        "you have an error in your sql syntax",
        "mysql_fetch_array",
        "pg_query",
        "ora-01756",
        "driver sql error"
    ]

    @classmethod
    def scan_target(cls, target_url: str, intensity: str = "standard") -> Dict[str, Any]:
        """
        Executes active crawl & non-destructive security testing against target_url.
        """
        findings = []
        endpoints_discovered = 0
        discovered_urls = []

        # Normalize base URL
        if not target_url.startswith(("http://", "https://")):
            target_url = "http://" + target_url
        base_url = target_url.rstrip("/")

        session = requests.Session()
        session.headers.update({
            "User-Agent": "VulnScan-Security-Auditor/1.0 (+https://vulnscan.sec)",
            "Accept": "text/html,application/json,*/*"
        })

        # Phase 1: Target Connectivity & Headers Analysis
        try:
            resp = session.get(base_url, timeout=5)
            endpoints_discovered += 1
            discovered_urls.append(base_url)
            headers = resp.headers

            # 1. Missing Content-Security-Policy (CSP)
            if "Content-Security-Policy" not in headers:
                findings.append({
                    "title": "Missing Content-Security-Policy (CSP) Header",
                    "category": "Security Misconfiguration",
                    "severity": "MEDIUM",
                    "confidence": "HIGH",
                    "detection_source": "DAST",
                    "cwe": "CWE-1021",
                    "cve": "",
                    "endpoint": base_url,
                    "http_method": "GET",
                    "evidence": f"HTTP Status: {resp.status_code}, Headers present: {', '.join(list(headers.keys())[:5])}",
                    "description": "The Content-Security-Policy header is missing from the HTTP response.",
                    "technical_explanation": "Content-Security-Policy restricts resources (such as scripts, images, stylesheets) that the browser is allowed to load for a given page.",
                    "potential_impact": "Increases susceptibility to Cross-Site Scripting (XSS), clickjacking, and data injection attacks.",
                    "recommended_solution": "Implement a strict Content-Security-Policy header (e.g. default-src 'self')."
                })

            # 2. Missing X-Frame-Options (Clickjacking)
            if "X-Frame-Options" not in headers and "Content-Security-Policy" not in headers:
                findings.append({
                    "title": "Missing X-Frame-Options (Clickjacking Risk)",
                    "category": "Security Misconfiguration",
                    "severity": "MEDIUM",
                    "confidence": "HIGH",
                    "detection_source": "DAST",
                    "cwe": "CWE-1021",
                    "cve": "",
                    "endpoint": base_url,
                    "http_method": "GET",
                    "evidence": "X-Frame-Options header not found in server response.",
                    "description": "The web application does not restrict embedding inside <iframe> or <frame> tags.",
                    "technical_explanation": "Attackers can render the application within a transparent frame on a malicious page to trick users into triggering unintended actions.",
                    "potential_impact": "Clickjacking, unauthorized transactions, account settings tampering.",
                    "recommended_solution": "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' to all HTTP responses."
                })

            # 3. Missing X-Content-Type-Options
            if "X-Content-Type-Options" not in headers:
                findings.append({
                    "title": "Missing X-Content-Type-Options Header",
                    "category": "Security Misconfiguration",
                    "severity": "LOW",
                    "confidence": "HIGH",
                    "detection_source": "DAST",
                    "cwe": "CWE-16",
                    "cve": "",
                    "endpoint": base_url,
                    "http_method": "GET",
                    "evidence": "Header X-Content-Type-Options missing",
                    "description": "Browsers may perform MIME-type sniffing on responses.",
                    "technical_explanation": "If a browser interprets a non-executable file as executable script, it can lead to script execution vulnerabilities.",
                    "potential_impact": "MIME confusion attacks, unintended script execution.",
                    "recommended_solution": "Send 'X-Content-Type-Options: nosniff' header."
                })

            # 4. Server Banner Exposure
            if "Server" in headers:
                server_val = headers.get("Server", "")
                if any(x in server_val.lower() for x in ["python", "werkzeug", "apache", "nginx", "express", "uvicorn"]):
                    findings.append({
                        "title": f"Information Disclosure: Server Version Header ({server_val})",
                        "category": "Sensitive Data Exposure",
                        "severity": "LOW",
                        "confidence": "HIGH",
                        "detection_source": "DAST",
                        "cwe": "CWE-200",
                        "cve": "",
                        "endpoint": base_url,
                        "http_method": "GET",
                        "evidence": f"Server: {server_val}",
                        "description": "The server exposes its detailed software name and version number.",
                        "technical_explanation": "Detailed banner exposure assists adversaries in fingerprinting known CVEs for targeted exploitation.",
                        "potential_impact": "Targeted vulnerability discovery based on exact version disclosures.",
                        "recommended_solution": "Suppress or mask the Server header in web server configuration."
                    })

            # 5. Permissive CORS
            if headers.get("Access-Control-Allow-Origin") == "*":
                findings.append({
                    "title": "Overly Permissive Cross-Origin Resource Sharing (CORS: *)",
                    "category": "Security Misconfiguration",
                    "severity": "MEDIUM",
                    "confidence": "HIGH",
                    "detection_source": "DAST",
                    "cwe": "CWE-942",
                    "cve": "",
                    "endpoint": base_url,
                    "http_method": "GET",
                    "evidence": "Access-Control-Allow-Origin: *",
                    "description": "Wildcard CORS policy allows any external domain to make cross-origin requests.",
                    "technical_explanation": "Untrusted origins can read authenticated data if credentials or sensitive tokens are exposed.",
                    "potential_impact": "Cross-origin data exfiltration.",
                    "recommended_solution": "Restrict allowed origins to trusted domains."
                })

        except Exception as e:
            # Target unreachable or network error
            return {
                "reachable": False,
                "error": str(e),
                "endpoints_discovered": 0,
                "findings": []
            }

        # Phase 2: Active Endpoint Discovery & Vulnerability Probes
        for path in cls.COMMON_PATHS:
            target_path_url = base_url + path
            try:
                probe_resp = session.get(target_path_url, timeout=3)
                if probe_resp.status_code in [200, 201, 301, 302, 401, 403]:
                    endpoints_discovered += 1
                    discovered_urls.append(target_path_url)

                # Active Test A: Reflected XSS Probe on search / q parameter
                if "search" in path or "?" in path:
                    canary_payload = "vulnscan_test_xss_probe_<img_src=x>"
                    encoded_payload = urllib.parse.quote(canary_payload)
                    test_url = target_path_url.replace("icecream", encoded_payload).replace("test", encoded_payload)
                    test_resp = session.get(test_url, timeout=3)
                    
                    if canary_payload in test_resp.text:
                        findings.append({
                            "title": "Active Reflected Cross-Site Scripting (XSS) in Search Parameter",
                            "category": "Cross-Site Scripting (XSS)",
                            "severity": "HIGH",
                            "confidence": "HIGH",
                            "detection_source": "DAST",
                            "cwe": "CWE-79",
                            "cve": "CVE-2024-XSS-DAST",
                            "endpoint": target_path_url,
                            "http_method": "GET",
                            "param_name": "q",
                            "evidence": f"Reflected unencoded payload in HTTP response: ...{canary_payload}...",
                            "description": "The web application reflects user query parameters in the HTML body without HTML entity encoding.",
                            "technical_explanation": "A non-destructive test string containing HTML tags was returned unescaped in the document DOM.",
                            "potential_impact": "Arbitrary JavaScript execution in victim browser sessions.",
                            "recommended_solution": "Contextually escape all parameters rendered into HTML templates."
                        })

                # Active Test B: SQL Injection Error Probing
                if "search" in path or "login" in path or "profile" in path:
                    sqli_probe_url = target_path_url + ("&" if "?" in target_path_url else "?") + "test_sqli='"
                    sqli_resp = session.get(sqli_probe_url, timeout=3)
                    for signature in cls.SQLI_ERROR_SIGNATURES:
                        if signature in sqli_resp.text.lower():
                            findings.append({
                                "title": "SQL Injection Detected via Database Error Signature",
                                "category": "SQL Injection (SQLi)",
                                "severity": "CRITICAL",
                                "confidence": "HIGH",
                                "detection_source": "DAST",
                                "cwe": "CWE-89",
                                "cve": "CVE-2024-SQLI-DAST",
                                "endpoint": target_path_url,
                                "http_method": "GET",
                                "param_name": "id" if "profile" in path else "q",
                                "evidence": f"Database error signature matched: '{signature}' in HTTP response",
                                "description": "The application returns raw database error diagnostics when exposed to single quotes.",
                                "technical_explanation": "An unhandled SQL syntax error indicates user-supplied input was directly interpolated into the database query engine.",
                                "potential_impact": "Authentication bypass, unauthorized database readout and table modification.",
                                "recommended_solution": "Use parameterized prepared statements and generic error pages."
                            })
                            break

                # Active Test C: Broken Access Control on /admin
                if "/admin" in path and probe_resp.status_code == 200:
                    findings.append({
                        "title": "Broken Access Control: Publicly Accessible Admin Dashboard",
                        "category": "Broken Access Control / IDOR",
                        "severity": "HIGH",
                        "confidence": "HIGH",
                        "detection_source": "DAST",
                        "cwe": "CWE-284",
                        "cve": "",
                        "endpoint": target_path_url,
                        "http_method": "GET",
                        "evidence": f"HTTP Status: 200 OK at administrative endpoint without credentials",
                        "description": "Administrative endpoint does not enforce authentication or session validation.",
                        "technical_explanation": "Unauthenticated HTTP requests can access the administrative interface directly.",
                        "potential_impact": "Unauthorized configuration changes and administrative data tampering.",
                        "recommended_solution": "Enforce role-based access control (RBAC) middleware on all /admin routes."
                    })

            except Exception:
                continue

        # Phase 3: Rate Limiting Assessment on Login (low-volume safe test)
        try:
            login_url = base_url + "/api/login"
            rate_limit_triggered = False
            for _ in range(6):
                lr = session.post(login_url, json={"username": "probe_user", "password": "invalid_pwd"}, timeout=2)
                if lr.status_code == 429:
                    rate_limit_triggered = True
                    break
            
            if not rate_limit_triggered and lr.status_code in [200, 400, 401]:
                findings.append({
                    "title": "Missing Rate Limiting on Authentication Endpoint",
                    "category": "DDoS and Rate-Limit Weaknesses",
                    "severity": "MEDIUM",
                    "confidence": "HIGH",
                    "detection_source": "DAST",
                    "cwe": "CWE-799",
                    "cve": "",
                    "endpoint": login_url,
                    "http_method": "POST",
                    "evidence": "Executed consecutive login attempts with no HTTP 429 Too Many Requests response.",
                    "description": "Authentication endpoint allows rapid consecutive credential submissions without throttling.",
                    "technical_explanation": "Missing rate limiting enables automated brute-force attacks and credential stuffing.",
                    "potential_impact": "Credential brute-forcing, account takeover.",
                    "recommended_solution": "Implement IP and account-based rate limiting (e.g. max 5 failed attempts per minute) and CAPTCHA."
                })
        except Exception:
            pass

        return {
            "reachable": True,
            "endpoints_discovered": endpoints_discovered,
            "discovered_urls": discovered_urls,
            "findings": findings
        }

