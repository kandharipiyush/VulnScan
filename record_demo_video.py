import os
import time
from playwright.sync_api import sync_playwright

output_dir = os.path.abspath("demo_recording")
os.makedirs(output_dir, exist_ok=True)

print("Starting automated Playwright screen recorder...")

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    context = browser.new_context(
        record_video_dir=output_dir,
        record_video_size={"width": 1280, "height": 720},
        viewport={"width": 1280, "height": 720}
    )
    page = context.new_page()

    # Scene 1: Landing Page
    print("Recording Scene 1: Landing Page...")
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(2000)
    page.evaluate("window.scrollBy({ top: 500, behavior: 'smooth' })")
    page.wait_for_timeout(2500)
    page.evaluate("window.scrollBy({ top: 700, behavior: 'smooth' })")
    page.wait_for_timeout(2500)

    # Scene 2: Main Dashboard
    print("Recording Scene 2: Security Dashboard Overview...")
    page.goto("http://localhost:3000/dashboard", wait_until="networkidle")
    page.wait_for_timeout(3500)
    page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
    page.wait_for_timeout(3000)

    # Scene 3: Universal New Scan Wizard
    print("Recording Scene 3: New Scan Wizard...")
    page.goto("http://localhost:3000/scans/new", wait_until="networkidle")
    page.wait_for_timeout(2500)
    page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
    page.wait_for_timeout(3000)

    # Scene 4: Live Scan Monitor
    print("Recording Scene 4: Live Scan Monitor & Telemetry...")
    page.goto("http://localhost:3000/scans/4", wait_until="networkidle")
    page.wait_for_timeout(4000)

    # Scene 5: Vulnerability Explorer
    print("Recording Scene 5: Vulnerability Explorer...")
    page.goto("http://localhost:3000/vulnerabilities", wait_until="networkidle")
    page.wait_for_timeout(3500)

    # Scene 6: Vulnerability Detail & Code Diff
    print("Recording Scene 6: Finding Detail & Code Remediation Diff...")
    page.goto("http://localhost:3000/vulnerabilities/1", wait_until="networkidle")
    page.wait_for_timeout(2500)
    page.evaluate("window.scrollBy({ top: 500, behavior: 'smooth' })")
    page.wait_for_timeout(3500)

    # Scene 7: Security Validation Lab
    print("Recording Scene 7: Security Validation Lab...")
    page.goto("http://localhost:3000/validation", wait_until="networkidle")
    page.wait_for_timeout(3500)

    # Scene 8: AI Security Assistant
    print("Recording Scene 8: AI Security Assistant...")
    page.goto("http://localhost:3000/assistant", wait_until="networkidle")
    page.wait_for_timeout(3500)

    # Scene 9: Reports & PDF Downloads
    print("Recording Scene 9: Reports & Compliance Exports...")
    page.goto("http://localhost:3000/reports", wait_until="networkidle")
    page.wait_for_timeout(3000)

    # Scene 10: CI/CD DevSecOps Gate
    print("Recording Scene 10: CI/CD DevSecOps Gate...")
    page.goto("http://localhost:3000/cicd", wait_until="networkidle")
    page.wait_for_timeout(3000)

    # Scene 11: iCream Shop Demonstration Target
    print("Recording Scene 11: iCream Shop Demo Target...")
    page.goto("http://127.0.0.1:8001", wait_until="networkidle")
    page.wait_for_timeout(3000)

    context.close()
    browser.close()

print("Browser recording complete!")
# Find recorded video file
files = os.listdir(output_dir)
webm_files = [f for f in files if f.endswith(".webm")]
if webm_files:
    latest = os.path.join(output_dir, webm_files[-1])
    renamed = os.path.join(output_dir, "vulnscan_demo_video.webm")
    if os.path.exists(renamed):
        os.remove(renamed)
    os.rename(latest, renamed)
    print(f"Demo video saved to: {renamed} ({os.path.getsize(renamed)} bytes)")
