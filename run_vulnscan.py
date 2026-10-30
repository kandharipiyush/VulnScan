import subprocess
import sys
import time
import os

print("""
===================================================================
                   VULNSCAN CYBERSECURITY PLATFORM
          AI-Powered Vulnerability Detection & DevSecOps
===================================================================
""")

backend_dir = os.path.abspath("backend")
frontend_dir = os.path.abspath("frontend")
icream_dir = os.path.abspath("icream-shop")

print("[1/3] Starting iCream Shop Demo Target on http://127.0.0.1:8001 ...")
p_icream = subprocess.Popen([sys.executable, "app.py"], cwd=icream_dir)

time.sleep(2)

print("[2/3] Starting VulnScan FastAPI Backend on http://127.0.0.1:8000 ...")
p_backend = subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8000"], cwd=backend_dir)

time.sleep(2)

print("[3/3] Starting Next.js Production Frontend on http://localhost:3000 ...")
p_frontend = subprocess.Popen(["npm", "run", "start"], cwd=frontend_dir, shell=True)

print("""
-------------------------------------------------------------------
Services Active:
  - Frontend Web SaaS:     http://localhost:3000
  - Backend REST API:      http://127.0.0.1:8000
  - Swagger Documentation: http://127.0.0.1:8000/docs
  - Demo Target Store:     http://127.0.0.1:8001

Press CTRL+C in this terminal to shut down all services.
-------------------------------------------------------------------
""")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nShutting down VulnScan services...")
    p_frontend.terminate()
    p_backend.terminate()
    p_icream.terminate()
    print("Services stopped.")

