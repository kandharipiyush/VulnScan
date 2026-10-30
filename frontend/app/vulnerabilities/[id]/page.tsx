"use client";
import { API_BASE } from "@/lib/api";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileCode,
  Terminal,
  Bot,
  Wand2,
  RefreshCw,
  Crosshair,
  ArrowLeft,
  Copy,
  Check
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function VulnerabilityDetailPage() {
  const params = useParams();
  const vulnId = params.id;
  const router = useRouter();

  const [vuln, setVuln] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [generatingFix, setGeneratingFix] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchVuln();
  }, [vulnId]);

  const fetchVuln = async () => {
    try {
      const res = await fetch(`${API_BASE}/vulnerabilities/${vulnId}`);
      if (res.ok) {
        const data = await res.json();
        setVuln(data);
      }
    } catch (e) {
      console.log("Error loading vulnerability:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFix = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`${API_BASE}/vulnerabilities/${vulnId}/verify`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyResult(data);
        if (data.status === "FIXED") {
          fetchVuln();
        }
      }
    } catch (e) {
      alert("Verification request failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleGenerateFix = async () => {
    setGeneratingFix(true);
    try {
      const res = await fetch(`${API_BASE}/vulnerabilities/${vulnId}/generate-fix`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setVuln((prev: any) => ({ ...prev, suggested_code: data.suggested_code }));
      }
    } catch (e) {
      alert("AI Fix generation failed");
    } finally {
      setGeneratingFix(false);
    }
  };

  const copySuggestedFix = () => {
    if (vuln?.suggested_code) {
      navigator.clipboard.writeText(vuln.suggested_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/vulnerabilities/${vulnId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, remediation_notes: `Manual status change to ${newStatus}` })
      });
      if (res.ok) {
        fetchVuln();
      }
    } catch (e) {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="pl-64 flex-1 bg-[#090d16] min-h-screen p-8 text-center text-slate-400">
        Loading finding details...
      </div>
    );
  }

  if (!vuln) {
    return (
      <div className="pl-64 flex-1 bg-[#090d16] min-h-screen p-8 text-center text-red-400">
        Vulnerability finding not found.
      </div>
    );
  }

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title={`Finding #${vuln.id}: ${vuln.title}`}
        subtitle={`Category: ${vuln.category} &bull; CWE: ${vuln.cwe || "N/A"}`}
        actionButton={
          <div className="flex items-center gap-2">
            <Link
              href="/vulnerabilities"
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Explorer
            </Link>
          </div>
        }
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Verification Alert Banner if active */}
        {verifyResult && (
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            verifyResult.verified ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300" : "bg-red-950/40 border-red-500/50 text-red-300"
          }`}>
            <div className="flex items-center gap-2.5 text-xs">
              {verifyResult.verified ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
              <span>{verifyResult.message}</span>
            </div>
            <span className="text-xs font-mono font-bold uppercase">{verifyResult.status}</span>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                vuln.status === "FIXED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
                vuln.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" :
                vuln.severity === "HIGH" ? "bg-orange-950 text-orange-400 border border-orange-800" :
                "bg-amber-950 text-amber-400 border border-amber-800"
              }`}>
                {vuln.status === "FIXED" ? "FIXED & RESOLVED" : vuln.severity}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Confidence: {vuln.confidence}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Source: {vuln.detection_source}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{vuln.title}</h2>
            <div className="text-xs font-mono text-slate-400">
              Location: {vuln.file_path || vuln.endpoint || "Codebase"}{vuln.line_number ? `:${vuln.line_number}` : ""}
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateFix}
              disabled={generatingFix}
              className="px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Wand2 className="h-3.5 w-3.5" /> {generatingFix ? "Generating..." : "Generate AI Fix"}
            </button>
            <button
              onClick={handleVerifyFix}
              disabled={verifying}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin" : ""}`} /> Verify Fix (Rescan)
            </button>
            <Link
              href="/validation"
              className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Crosshair className="h-3.5 w-3.5" /> Open Validation Mode
            </Link>
          </div>
        </div>

        {/* Technical Explanations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-400" /> Technical Root Cause
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {vuln.technical_explanation || vuln.description}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" /> Potential Security Impact
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {vuln.potential_impact || "Exploitation of this vulnerability may allow unauthorized manipulation, data access, or privilege escalation."}
            </p>
          </div>
        </div>

        {/* Technical Evidence Snippet */}
        {vuln.evidence && (
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-2">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-400">
              Technical Evidence / HTTP Observation
            </h3>
            <div className="bg-[#070b14] p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
              <code>{vuln.evidence}</code>
            </div>
          </div>
        )}

        {/* Side-by-Side Code Comparison: Vulnerable vs Secure Fix */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileCode className="h-4 w-4 text-violet-400" /> Code Remediation Diff (Vulnerable vs Safe)
            </h3>
            <button
              onClick={copySuggestedFix}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy Suggested Fix"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Vulnerable Code Box */}
            <div className="rounded-xl border border-red-900/40 bg-red-950/10 overflow-hidden">
              <div className="px-3.5 py-2 bg-red-950/40 border-b border-red-900/40 text-[11px] font-mono text-red-300 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> Vulnerable Pattern
              </div>
              <pre className="p-4 font-mono text-xs text-red-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {vuln.original_code || "# Vulnerable string concatenation"}
              </pre>
            </div>

            {/* Suggested Secure Replacement Box */}
            <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 overflow-hidden">
              <div className="px-3.5 py-2 bg-emerald-950/40 border-b border-emerald-900/40 text-[11px] font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Suggested Safe Implementation
              </div>
              <pre className="p-4 font-mono text-xs text-emerald-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {vuln.suggested_code || "# Safe parameterized statement"}
              </pre>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed pt-2">
            <strong>Remediation Guidance:</strong> {vuln.recommended_solution}
          </div>
        </div>

        {/* Manual Status Overrides */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Change finding lifecycle status:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange("FIXED")}
              className="px-2.5 py-1 rounded bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800"
            >
              Mark as Fixed
            </button>
            <button
              onClick={() => handleStatusChange("FALSE_POSITIVE")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              False Positive
            </button>
            <button
              onClick={() => handleStatusChange("ACCEPTED_RISK")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Accept Risk
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

