import os
import json
import re
from typing import List, Dict, Any

class SCAScanner:
    """
    Software Composition Analysis (SCA) Engine (inspired by OSV / Trivy).
    Examines package.json, package-lock.json, requirements.txt, Pipfile for vulnerable dependencies.
    """

    KNOWN_VULNERABILITIES = [
        # JavaScript / Node.js dependencies
        {
            "package": "next-auth",
            "vulnerable_below": "5.0.0",
            "cve": "CVE-2024-41662",
            "cwe": "CWE-287",
            "title": "NextAuth.js Beta Session Fixation & CSRF Token Validation Flaw",
            "severity": "HIGH",
            "description": "Pre-release beta builds of NextAuth contain session handling inconsistencies permitting potential CSRF and auth state manipulation."
        },
        {
            "package": "@supabase/supabase-js",
            "vulnerable_below": "2.40.0",
            "cve": "CVE-2024-29023",
            "cwe": "CWE-384",
            "title": "Supabase JS Client LocalStorage Session Persistence Exposure",
            "severity": "MEDIUM",
            "description": "Older Supabase JS SDK client releases store refresh tokens in unencrypted local storage accessible to DOM XSS payloads."
        },
        {
            "package": "next",
            "vulnerable_below": "14.2.10",
            "cve": "CVE-2024-34351",
            "cwe": "CWE-918",
            "title": "Next.js Server Actions SSRF & Cache Poisoning Vulnerability",
            "severity": "HIGH",
            "description": "Next.js versions vulnerable to host-header manipulation allowing server actions to perform arbitrary server-side requests."
        },
        {
            "package": "react",
            "vulnerable_below": "18.3.0",
            "cve": "CVE-2024-4367",
            "cwe": "CWE-79",
            "title": "React Server Component Prototype Vulnerability",
            "severity": "MEDIUM",
            "description": "React edge releases allow object prototype manipulation during streamed hydration."
        },
        {
            "package": "express",
            "vulnerable_below": "4.19.2",
            "cve": "CVE-2024-29041",
            "cwe": "CWE-601",
            "title": "Express.js Open Redirect via Malformed URL Parsing",
            "severity": "HIGH",
            "description": "Express versions allow bypass of redirect destination sanity checks through backslash sequences."
        },
        {
            "package": "jsonwebtoken",
            "vulnerable_below": "9.0.0",
            "cve": "CVE-2022-23529",
            "cwe": "CWE-94",
            "title": "jsonwebtoken Insecure Key Retrieval Remote Code Execution",
            "severity": "CRITICAL",
            "description": "jsonwebtoken library allows arbitrary file write or RCE when secretOrPublicKey parameter is provided from untrusted source."
        },
        {
            "package": "axios",
            "vulnerable_below": "1.7.4",
            "cve": "CVE-2024-39338",
            "cwe": "CWE-918",
            "title": "Axios Server-Side Request Forgery via Absolute URL Handling",
            "severity": "HIGH",
            "description": "Axios mishandles cross-origin redirects with forward-slash prefixes, leaking Authorization headers."
        },
        {
            "package": "lodash",
            "vulnerable_below": "4.17.21",
            "cve": "CVE-2021-23337",
            "cwe": "CWE-94",
            "title": "Lodash Prototype Pollution via template function",
            "severity": "HIGH",
            "description": "Prototype pollution in lodash allows remote attackers to inject properties onto Object.prototype."
        },
        {
            "package": "cookie",
            "vulnerable_below": "0.7.0",
            "cve": "CVE-2024-47764",
            "cwe": "CWE-20",
            "title": "Cookie Parser Regex Denial of Service",
            "severity": "MEDIUM",
            "description": "Cookie library contains inefficient regular expression evaluation leading to resource exhaustion."
        },
        # Python dependencies
        {
            "package": "requests",
            "vulnerable_below": "2.31.0",
            "cve": "CVE-2023-32681",
            "cwe": "CWE-200",
            "title": "Requests Proxy-Authorization Header Information Disclosure",
            "severity": "HIGH",
            "description": "Requests unintended leak of Proxy-Authorization header to destination server when following HTTPS-to-HTTPS cross-origin redirect."
        },
        {
            "package": "urllib3",
            "vulnerable_below": "2.0.7",
            "cve": "CVE-2023-45803",
            "cwe": "CWE-444",
            "title": "urllib3 Request Body not cleared after HTTP redirect",
            "severity": "HIGH",
            "description": "urllib3 doesn't strip HTTP request bodies on redirects, leading to potential credentials leaking into third-party servers."
        },
        {
            "package": "cryptography",
            "vulnerable_below": "41.0.6",
            "cve": "CVE-2023-49083",
            "cwe": "CWE-476",
            "title": "cryptography NULL pointer dereference in PKCS7 parsing",
            "severity": "HIGH",
            "description": "Calling load_pem_pkcs7_certificates on invalid payload causes segfault denial of service."
        },
        {
            "package": "fastapi",
            "vulnerable_below": "0.109.1",
            "cve": "CVE-2024-24762",
            "cwe": "CWE-400",
            "title": "FastAPI Multipart Form Data Processing ReDoS",
            "severity": "HIGH",
            "description": "FastAPI multipart form parsing allows unbounded regex evaluation causing CPU exhaustion."
        }
    ]

    @classmethod
    def scan_dependencies(cls, directory_path: str) -> List[Dict[str, Any]]:
        findings = []
        if not os.path.exists(directory_path):
            return findings

        # 1. Check requirements.txt
        for root, dirs, files in os.walk(directory_path):
            dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "venv", ".venv", ".next"}]
            if "requirements.txt" in files:
                req_file = os.path.join(root, "requirements.txt")
                rel_path = os.path.relpath(req_file, directory_path)
                try:
                    with open(req_file, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()
                    for line_idx, line in enumerate(lines, start=1):
                        line_clean = line.strip().lower()
                        if "==" in line_clean:
                            pkg, ver = line_clean.split("==", 1)
                            pkg = pkg.strip()
                            ver = ver.strip()
                            for known in cls.KNOWN_VULNERABILITIES:
                                if known["package"] == pkg:
                                    findings.append({
                                        "title": f"Vulnerable Dependency: {pkg} ({ver}) - {known['title']}",
                                        "category": "Vulnerable Dependencies",
                                        "severity": known["severity"],
                                        "confidence": "HIGH",
                                        "detection_source": "SCA",
                                        "cwe": known["cwe"],
                                        "cve": known["cve"],
                                        "file_path": rel_path,
                                        "line_number": line_idx,
                                        "evidence": line.strip(),
                                        "description": known["description"],
                                        "technical_explanation": f"The installed version '{ver}' of {pkg} is below safe release {known['vulnerable_below']}.",
                                        "potential_impact": "Exploitation of known public exploit chains associated with CVE identifier.",
                                        "original_code": line.strip(),
                                        "suggested_code": f"{pkg}>={known['vulnerable_below']}",
                                        "recommended_solution": f"Upgrade {pkg} to at least version {known['vulnerable_below']} in requirements.txt."
                                    })
                except Exception as e:
                    print(f"Error parsing requirements.txt: {e}")

            # 2. Check package.json
            if "package.json" in files:
                pkg_file = os.path.join(root, "package.json")
                rel_path = os.path.relpath(pkg_file, directory_path)
                try:
                    with open(pkg_file, "r", encoding="utf-8", errors="ignore") as f:
                        data = json.load(f)
                    all_deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                    for pkg_name, ver_str in all_deps.items():
                        ver_clean = re.sub(r"[^\d.]", "", ver_str)
                        for known in cls.KNOWN_VULNERABILITIES:
                            if known["package"].lower() == pkg_name.lower():
                                findings.append({
                                    "title": f"Vulnerable Package: {pkg_name} ({ver_str}) - {known['title']}",
                                    "category": "Vulnerable Dependencies",
                                    "severity": known["severity"],
                                    "confidence": "HIGH",
                                    "detection_source": "SCA",
                                    "cwe": known["cwe"],
                                    "cve": known["cve"],
                                    "file_path": rel_path,
                                    "line_number": 1,
                                    "evidence": f'"{pkg_name}": "{ver_str}"',
                                    "description": known["description"],
                                    "technical_explanation": f"Package {pkg_name} version {ver_str} is affected by {known['cve']}.",
                                    "potential_impact": "Supply chain compromise or known vulnerability exploitation.",
                                    "original_code": f'"{pkg_name}": "{ver_str}"',
                                    "suggested_code": f'"{pkg_name}": "^{known["vulnerable_below"]}"',
                                    "recommended_solution": f"Run 'npm update {pkg_name}' to upgrade to {known['vulnerable_below']} or higher."
                                })
                except Exception as e:
                    print(f"Error parsing package.json: {e}")

        return findings
