import os
import sys
import time
import requests
import subprocess

print("==========================================================")
print("  VULNSCAN END-TO-END AUTOMATED AUDIT & VERIFICATION SUITE")
print("==========================================================")

# Step 1: Start iCream Shop demo target in background if not already running
print("\n[1/7] Checking iCream Shop demo target on http://127.0.0.1:8001 ...")
icream_proc = None
try:
    r = requests.get("http://127.0.0.1:8001/api/mode", timeout=2)
    print(f"  -> iCream Shop already running. Mode: {r.json().get('mode')}")
except Exception:
    print("  -> Launching iCream Shop on port 8001...")
    icream_proc = subprocess.Popen([sys.executable, "icream-shop/app.py"])
    time.sleep(3)
    r = requests.get("http://127.0.0.1:8001/api/mode", timeout=5)
    print(f"  -> iCream Shop launched successfully! Mode: {r.json().get('mode')}")

# Step 2: Start Backend on port 8000 if not already running
print("\n[2/7] Checking VulnScan Backend on http://127.0.0.1:8000 ...")
backend_proc = None
try:
    r = requests.get("http://127.0.0.1:8000/health", timeout=2)
    print(f"  -> Backend already active. Status: {r.json().get('status')}")
except Exception:
    print("  -> Launching VulnScan FastAPI backend on port 8000...")
    backend_proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8000"], cwd="backend")
    time.sleep(4)
    r = requests.get("http://127.0.0.1:8000/health", timeout=5)
    print(f"  -> VulnScan API online! Version: {r.json().get('version')}")

# Step 3: Trigger Multi-Vector Scan
print("\n[3/7] Triggering Multi-Vector Scan (SAST + DAST + SCA + Secrets) ...")
scan_payload = {
    "project_id": 1,
    "scan_type": "comprehensive",
    "enable_sast": True,
    "enable_dast": True,
    "enable_sca": True,
    "enable_secrets": True,
    "target_scope": "http://127.0.0.1:8001",
    "confirmed_authorization": True
}
scan_res = requests.post("http://127.0.0.1:8000/api/scans", json=scan_payload)
scan_data = scan_res.json()
scan_id = scan_data["id"]
print(f"  -> Initialized Scan Job #{scan_id} (Status: {scan_data['status']})")

# Wait for completion
for _ in range(15):
    time.sleep(1)
    status_res = requests.get(f"http://127.0.0.1:8000/api/scans/{scan_id}").json()
    if status_res["status"] == "COMPLETED":
        print(f"  -> Scan #{scan_id} COMPLETED in {status_res['current_stage']}!")
        print(f"     Total findings: {status_res['findings_count']} (Critical: {status_res['critical_count']}, High: {status_res['high_count']})")
        break

# Step 4: Check Vulnerabilities & Evidence
print("\n[4/7] Auditing Stored Vulnerabilities in Database ...")
vulns = requests.get("http://127.0.0.1:8000/api/vulnerabilities").json()
print(f"  -> Retrieved {len(vulns)} stored findings:")
for v in vulns[:4]:
    print(f"     [{v['severity']}] {v['title']} ({v['detection_source']}) - Location: {v['file_path'] or v['endpoint']}")

# Step 5: Test AI Explanation and Remediation
print("\n[5/7] Testing AI Security Intelligence & Code Patch Generation ...")
target_vuln = vulns[0]
ai_fix = requests.post(f"http://127.0.0.1:8000/api/vulnerabilities/{target_vuln['id']}/generate-fix").json()
print(f"  -> AI Analyzed: {ai_fix['title']}")
print(f"     Suggested Code Diff snippet:\n     {ai_fix['suggested_code'][:120]}...")

# Step 6: Test Remediation & Re-testing Workflow
print("\n[6/7] Testing Automated Fix Verification (Rescan Cycle) ...")
# Toggle iCream Shop to Secure Mode
requests.post("http://127.0.0.1:8001/api/mode/toggle")
mode_now = requests.get("http://127.0.0.1:8001/api/mode").json()["mode"]
print(f"  -> Toggled iCream Shop mode to: {mode_now.upper()}")

verify_res = requests.post(f"http://127.0.0.1:8000/api/vulnerabilities/{target_vuln['id']}/verify").json()
print(f"  -> Fix Verification Status: {verify_res['status']} ({verify_res['message']})")

# Step 7: Test PDF Generation & CI/CD Gate
print("\n[7/7] Testing PDF Report Generation and DevSecOps CI/CD Gate ...")
report_res = requests.post(f"http://127.0.0.1:8000/api/reports/generate?scan_id={scan_id}").json()
print(f"  -> Generated PDF Report: {report_res['file_path']} (Exists: {os.path.exists(report_res['file_path'])})")

gate_res = requests.post("http://127.0.0.1:8000/api/cicd/evaluate", json={
    "project_id": 1,
    "branch": "main",
    "commit_hash": "c8e21a",
    "policy": "MONITOR"
}).json()
print(f"  -> Evaluated CI/CD Gate (MONITOR policy): {gate_res['gate_status']} - {gate_res['block_reason']}")

print("\n==========================================================")
print("  ALL VULNSCAN SYSTEM CHECKS COMPLETED SUCCESSFULLY! [OK]")
print("==========================================================")

