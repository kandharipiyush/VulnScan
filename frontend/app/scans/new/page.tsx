"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Monitor,
  Globe,
  Play,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Layers,
  AlertCircle,
  FolderPlus
} from "lucide-react";
import GithubIcon from "@/components/GithubIcon";
import DashboardHeader from "@/components/DashboardHeader";

export default function NewScanPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [scanMode, setScanMode] = useState<"github" | "localhost" | "live_url">("github");
  const [targetUrl, setTargetUrl] = useState("https://github.com/kandharipiyush/DesignSphere.git");
  const [projectName, setProjectName] = useState("DesignSphere");
  const [intensity, setIntensity] = useState("comprehensive");

  // Module Toggles
  const [enableSast, setEnableSast] = useState(true);
  const [enableDast, setEnableDast] = useState(true);
  const [enableSca, setEnableSca] = useState(true);
  const [enableSecrets, setEnableSecrets] = useState(true);
  const [confirmedAuth, setConfirmedAuth] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data))
      .catch(() => {});
  }, []);

  const handleSourceChange = (mode: "github" | "localhost" | "live_url") => {
    setScanMode(mode);
    if (mode === "github") {
      setTargetUrl("https://github.com/kandharipiyush/DesignSphere.git");
      setProjectName("DesignSphere");
    } else if (mode === "localhost") {
      setTargetUrl("http://127.0.0.1:8001");
      setProjectName("iCream Shop (Localhost)");
    } else {
      setTargetUrl("https://example.com");
      setProjectName("Live Target Audit");
    }
  };

  const handleUrlBlur = (url: string) => {
    if (url.includes("github.com")) {
      const clean = url.trim().rstrip("/").split("/").pop()?.replace(".git", "");
      if (clean && (!projectName || projectName === "DesignSphere" || projectName === "New Project")) {
        setProjectName(clean);
      }
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedAuth) {
      alert("Please confirm security testing authorization for this target.");
      return;
    }

    if (!targetUrl.trim()) {
      alert("Please enter a valid target URL or repository.");
      return;
    }

    setStarting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_url: targetUrl.trim(),
          target_scope: targetUrl.trim(),
          project_name: projectName.trim() || "Dynamic Scan Target",
          project_type: scanMode,
          scan_type: intensity,
          enable_sast: enableSast,
          enable_dast: enableDast,
          enable_sca: enableSca,
          enable_secrets: enableSecrets,
          enable_api_security: true,
          confirmed_authorization: confirmedAuth
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to initialize scan");
      }

      const scan = await res.json();
      router.push(`/scans/${scan.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to start scan");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Universal Security Scan Wizard"
        subtitle="Dynamic vulnerability scanner for GitHub repositories, localhost apps, and live websites"
      />

      <main className="p-8 max-w-4xl mx-auto">
        <form onSubmit={handleStartScan} className="space-y-8">
          {/* STEP 1: Select Scan Source */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">1. Select Target Ingestion Vector</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card A: GitHub */}
              <div
                onClick={() => handleSourceChange("github")}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  scanMode === "github"
                    ? "bg-emerald-600/15 border-emerald-500 shadow-lg shadow-emerald-500/10"
                    : "bg-[#0f172a] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <GithubIcon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-sm">GitHub Repository</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Clones repo dynamically & runs full SAST, Secrets, and SCA.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 mt-3 truncate">
                  https://github.com/owner/repo.git
                </div>
              </div>

              {/* Card B: Localhost */}
              <div
                onClick={() => handleSourceChange("localhost")}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  scanMode === "localhost"
                    ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                    : "bg-[#0f172a] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                  <Monitor className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Localhost Website</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Audit applications running on your machine with active DAST crawler.
                </p>
                <div className="text-[10px] font-mono text-blue-400 mt-3">http://localhost:3000 / 8001</div>
              </div>

              {/* Card C: Live Website */}
              <div
                onClick={() => handleSourceChange("live_url")}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  scanMode === "live_url"
                    ? "bg-violet-600/15 border-violet-500 shadow-lg shadow-violet-500/10"
                    : "bg-[#0f172a] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Live Deployed Website</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Audit deployed production or staging URLs with domain scope lock.
                </p>
                <div className="text-[10px] font-mono text-violet-400 mt-3">https://app.yourdomain.com</div>
              </div>
            </div>
          </div>

          {/* STEP 2: Target URL & Project Configuration */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white">2. Target Details & Scope</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {scanMode === "github" ? "GitHub Repository Clone URL (.git)" : "Target Web Address (URL)"}
                </label>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder={
                    scanMode === "github"
                      ? "https://github.com/kandharipiyush/DesignSphere.git"
                      : "http://127.0.0.1:8001"
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Project Label Name
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. DesignSphere Platform"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {scanMode === "github"
                ? "Repository will be cloned dynamically into an isolated sandbox to run static AST, secret entropy, and dependency scans."
                : "Active web crawlers will discover endpoints, test headers, and execute safe non-destructive reflection tests."}
            </div>
          </div>

          {/* STEP 3: Configure Detection Engines */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white">3. Configure Detection Engines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                <div>
                  <div className="text-xs font-semibold text-white">Static Application Security Testing (SAST)</div>
                  <div className="text-[11px] text-slate-400">AST parsing, SQLi, DOM XSS, RCE, unsafe logic</div>
                </div>
                <input
                  type="checkbox"
                  checked={enableSast}
                  onChange={(e) => setEnableSast(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </label>

              <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                <div>
                  <div className="text-xs font-semibold text-white">Secret Detection</div>
                  <div className="text-[11px] text-slate-400">Exposed Supabase keys, JWTs, AWS & API tokens</div>
                </div>
                <input
                  type="checkbox"
                  checked={enableSecrets}
                  onChange={(e) => setEnableSecrets(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </label>

              <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                <div>
                  <div className="text-xs font-semibold text-white">Software Composition Analysis (SCA)</div>
                  <div className="text-[11px] text-slate-400">Vulnerable npm packages, NextAuth, CVE databases</div>
                </div>
                <input
                  type="checkbox"
                  checked={enableSca}
                  onChange={(e) => setEnableSca(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </label>

              <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                <div>
                  <div className="text-xs font-semibold text-white">Dynamic Testing (DAST)</div>
                  <div className="text-[11px] text-slate-400">Runtime HTTP probes, reflection, headers (for live targets)</div>
                </div>
                <input
                  type="checkbox"
                  checked={enableDast}
                  onChange={(e) => setEnableDast(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* STEP 4: Authorization Confirmation */}
          <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-900/50">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedAuth}
                onChange={(e) => setConfirmedAuth(e.target.checked)}
                className="mt-1 rounded text-blue-600 focus:ring-0"
              />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Authorization & Scope Confirmation:</strong> I confirm that I own or have permission to audit this repository/target. Scanning will be executed non-destructively.
              </div>
            </label>
          </div>

          {/* STEP 5: Start Button */}
          <button
            type="submit"
            disabled={starting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition"
          >
            {starting ? "Initializing Universal Scanner..." : "Start Security Scan"} <Play className="h-4 w-4 fill-current" />
          </button>
        </form>
      </main>
    </div>
  );
}
