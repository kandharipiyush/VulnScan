"use client";
import { API_BASE } from "@/lib/api";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  Clock,
  Terminal,
  FileCode,
  Bug,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

const STAGES = [
  "Initialization",
  "Technology Detection",
  "Static Code Analysis (SAST)",
  "Secret Detection",
  "Dependency Security (SCA)",
  "Dynamic Testing (DAST)",
  "AI Intelligence & Remediation",
  "Report Generation",
  "Completed"
];

export default function LiveScanMonitorPage() {
  const params = useParams();
  const scanId = params.id;
  const router = useRouter();

  const [scan, setScan] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScanDetails();
    const interval = setInterval(fetchScanDetails, 2000);
    return () => clearInterval(interval);
  }, [scanId]);

  const fetchScanDetails = async () => {
    try {
      const sRes = await fetch(`${API_BASE}/scans/${scanId}`);
      if (sRes.ok) {
        const sData = await sRes.json();
        setScan(sData);
      }

      const lRes = await fetch(`${API_BASE}/scans/${scanId}/logs`);
      if (lRes.ok) {
        const lData = await lRes.json();
        setLogs(lData);
      }
    } catch (e) {
      console.log("Error updating scan monitor:", e);
    } finally {
      setLoading(false);
    }
  };

  const getStageStatus = (stageName: string) => {
    if (!scan) return "pending";
    if (scan.status === "COMPLETED") return "completed";
    if (scan.current_stage === stageName) return "running";
    const currentIndex = STAGES.indexOf(scan.current_stage);
    const targetIndex = STAGES.indexOf(stageName);
    return targetIndex < currentIndex ? "completed" : "pending";
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title={`Live Scan Monitor &bull; Scan #${scanId}`}
        subtitle={`Real-time telemetry and scanner engine execution`}
        actionButton={
          scan?.status === "COMPLETED" ? (
            <Link
              href="/vulnerabilities"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/30 transition"
            >
              Explore Findings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Scanning in progress...
            </div>
          )
        }
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Top Progress Overview Card */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono text-slate-400">Scan Execution Progress</span>
              <div className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{scan?.current_stage || "Initializing..."}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                  scan?.status === "COMPLETED" ? "bg-emerald-950 text-emerald-400" : "bg-blue-950 text-blue-400"
                }`}>
                  {scan?.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-blue-400">{scan?.progress_percent || 0}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${scan?.progress_percent || 5}%` }}
            ></div>
          </div>

          {/* Counters Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-slate-400 text-xs">Files Analyzed</div>
              <div className="text-lg font-bold text-white mt-1">{scan?.files_scanned || 0}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Endpoints Discovered</div>
              <div className="text-lg font-bold text-white mt-1">{scan?.endpoints_discovered || 0}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Dependencies Checked</div>
              <div className="text-lg font-bold text-white mt-1">{scan?.dependencies_analysed || 0}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Findings Flagged</div>
              <div className="text-lg font-bold text-red-400 mt-1">{scan?.findings_count || 0}</div>
            </div>
          </div>
        </div>

        {/* Two Columns: Scanning Stages & Realtime Terminal Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanning Stages */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" /> Pipeline Stages
            </h3>
            <div className="space-y-3">
              {STAGES.map((st, idx) => {
                const status = getStageStatus(st);
                return (
                  <div key={st} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="font-mono text-slate-500">#{idx + 1}</span>
                      <span className={status === "completed" ? "text-slate-200" : status === "running" ? "text-blue-400 font-bold" : "text-slate-500"}>
                        {st}
                      </span>
                    </div>
                    <div>
                      {status === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {status === "running" && <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />}
                      {status === "pending" && <span className="h-2 w-2 rounded-full bg-slate-700 inline-block"></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Terminal Log Console */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" /> Scanner Execution Logs
              </h3>
              <span className="text-[11px] font-mono text-slate-500">{logs.length} events logged</span>
            </div>

            <div className="flex-1 bg-[#070b14] rounded-xl p-4 font-mono text-xs text-slate-300 border border-slate-800/80 overflow-y-auto max-h-[420px] space-y-2">
              {logs.length === 0 ? (
                <div className="text-slate-600">Initializing scanner daemon...</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-600 select-none">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      log.level === "SUCCESS" ? "bg-emerald-950 text-emerald-400" :
                      log.level === "WARNING" ? "bg-amber-950 text-amber-400" :
                      log.level === "ERROR" ? "bg-red-950 text-red-400" :
                      "bg-blue-950 text-blue-400"
                    }`}>
                      {log.stage}
                    </span>
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

