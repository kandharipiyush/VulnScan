Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.Rate = 0
$speaker.Volume = 100
$outputFile = Join-Path (Get-Location) "demo_voiceover.wav"
$speaker.SetOutputToWaveFile($outputFile)

$script = @"
Welcome to VulnScan, the AI-powered automated vulnerability detection, security validation, and DevSecOps platform.
VulnScan unifies Static Application Security Testing, Dynamic web crawling, Dependency analysis, and hardcoded secret detection.
Here on the Overview Dashboard, security teams monitor real-time security posture, severity distributions, and active findings.
In the New Scan wizard, developers can scan localhost websites, live production domains, or clone any GitHub repository dynamically.
As the multi-vector scan runs, the live monitor streams real-time execution logs and tracks discovered endpoints and files.
In the Vulnerability Explorer, each finding provides technical evidence, CWE classifications, and side-by-side code remediation diffs.
The Security Validation Lab performs non-destructive exploitability validation in authorized environments.
Our AI Security Assistant explains root causes and generates parameterized patches to eliminate injection risks.
Finally, VulnScan compiles executive ReportLab PDF dossiers and enforces DevSecOps deployment gates to keep releases secure.
Find vulnerabilities before attackers do. Welcome to VulnScan.
"@

$speaker.Speak($script)
$speaker.Dispose()
Write-Host "Voiceover audio saved successfully: $outputFile"

