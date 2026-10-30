"use client";
import { API_BASE } from "@/lib/api";

import React, { useState, useEffect } from "react";
import {
  GitBranch,
  ShieldCheck,
  ShieldAlert,
  Play,
  Copy,
  Check,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function CiCdPage() {
  const [policy, setPolicy] = useState("STRICT");
  const [evaluating, setEvaluating] = useState(false);
  const [gateResult, setGateResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const WORKFLOW_YAML = `name: VulnScan DevSecOps Gate

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main" ]

jobs:
  security-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Trigger VulnScan Automated Gate Check
        run: |
          response=$(curl -s -X POST "${API_BASE}/cicd/evaluate" \\
            -H "Content-Type: application/json" \\
            -d '{"project_id": 1, "branch": "\${{ github.ref_name }}", "commit_hash": "\${{ github.sha }}", "policy": "${policy}"}')
          
          status=$(echo $response | grep -o '"gate_status":"[^"]*' | cut -d'"' -f4)
          if [ "$status" = "FAIL" ]; then
            echo "::error::VulnScan Security Gate Failed! Deployment blocked by policy."
            exit 1
          else
            echo "VulnScan Security Gate Passed successfully!"
          fi
`;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/cicd/history`);
      if (res.ok) setHistory(await res.json());
    } catch {}
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    setGateResult(null);
    try {
      const res = await fetch(`${API_BASE}/cicd/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: 1,
          branch: "main",
          commit_hash: "a4f91b2",
          policy
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGateResult(data);
        fetchHistory();
      }
    } catch (e) {
      alert("Gate evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const copyYaml = () => {
    navigator.clipboard.writeText(WORKFLOW_YAML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="CI/CD DevSecOps Integration"
        subtitle="Enforce automated security quality gates in GitHub Actions and continuous deployment pipelines"
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Gate Policy Selector & Simulation Card */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-400" /> Active Security Gate Policy
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Determine policy thresholds required before deployments are approved or blocked.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              {["STRICT", "BALANCED", "MONITOR"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPolicy(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    policy === p
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            {policy === "STRICT" && (
              <div>
                <strong className="text-red-400">Strict Gate:</strong> Any unverified Critical or High severity findings will trigger a hard pipeline exit (Exit Code 1) and block deployment.
              </div>
            )}
            {policy === "BALANCED" && (
              <div>
                <strong className="text-amber-400">Balanced Gate:</strong> Blocks deployment exclusively when confirmed Critical findings remain open. High severity items generate warnings.
              </div>
            )}
            {policy === "MONITOR" && (
              <div>
                <strong className="text-blue-400">Monitor Gate:</strong> Always evaluates to PASS. Logs findings to pull request annotations without blocking code progression.
              </div>
            )}
          </div>

          {/* Test Gate Button */}
          <div className="flex justify-end">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> {evaluating ? "Evaluating Policy..." : "Simulate Pipeline Gate Check"}
            </button>
          </div>
        </div>

        {/* Live Gate Result Banner if tested */}
        {gateResult && (
          <div className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${
            gateResult.gate_status === "PASS"
              ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/20 border-red-500/40 text-red-300"
          }`}>
            <div className="flex items-start gap-3">
              {gateResult.gate_status === "PASS" ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Pipeline Gate Result: {gateResult.gate_status}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-900 border border-slate-800">
                    Policy: {gateResult.policy}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {gateResult.block_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Copyable GitHub Actions Workflow */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" /> Copyable GitHub Actions Workflow (.github/workflows/vulnscan.yml)
            </h3>
            <button
              onClick={copyYaml}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy YAML"}
            </button>
          </div>
          <pre className="p-4 bg-[#070b14] rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
            {WORKFLOW_YAML}
          </pre>
        </div>

        {/* Pipeline Execution History */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
            Pipeline Gate Execution Log
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Pipeline ID</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Commit</th>
                  <th className="py-3 px-4">Policy</th>
                  <th className="py-3 px-4">Gate Decision</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      No gate evaluations triggered yet. Click &apos;Simulate Pipeline Gate Check&apos;.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono text-slate-400">#{h.id}</td>
                      <td className="py-3 px-4 text-slate-200">{h.branch}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{h.commit_hash}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{h.policy}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.gate_status === "PASS" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                        }`}>
                          {h.gate_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={h.block_reason}>
                        {h.block_reason}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(h.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

