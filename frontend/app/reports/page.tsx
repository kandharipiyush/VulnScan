"use client";
import { API_BASE } from "@/lib/api";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  FileCode,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Calendar,
  HardDrive
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.log("Error loading reports:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/reports/generate?scan_id=1`, {
        method: "POST"
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (e) {
      alert("Failed to regenerate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Reports & Compliance Exports"
        subtitle="Download comprehensive PDF security assessment dossiers, JSON findings, and CSV exports"
        actionButton={
          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} /> Generate Fresh PDF
          </button>
        }
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Quick Export Formats Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Executive & Technical PDF</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Formatted multi-page assessment dossier with cover page, risk distributions, and code remediation roadmap.
            </p>
            {reports.length > 0 ? (
              <a
                href={`${API_BASE}/reports/${reports[0].id}/download`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="h-3.5 w-3.5" /> Download Latest PDF
              </a>
            ) : (
              <button
                onClick={handleRegenerate}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-medium"
              >
                Generate Report
              </button>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <FileCode className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">Structured JSON Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Full machine-readable vulnerability telemetry for SIEM, SOAR, and custom automation pipelines.
            </p>
            <a
              href={`${API_BASE}/reports/export/json?scan_id=1`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON Findings
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-sm mb-1">CSV Spreadsheet Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Tabular spreadsheet export for audit teams, compliance officers, and executive review meetings.
            </p>
            <a
              href={`${API_BASE}/reports/export/csv?scan_id=1`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV Spreadsheet
            </a>
          </div>
        </div>

        {/* Generated Reports Table */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Generated Report History</h3>
            <span className="text-xs font-mono text-slate-400">{reports.length} reports archived</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Generated At</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No reports generated yet. Click &apos;Generate Fresh PDF&apos; above.
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">#{r.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{r.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-300 font-mono font-bold">
                          {r.format}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {r.file_size_bytes ? `${Math.round(r.file_size_bytes / 1024)} KB` : "7 KB"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`${API_BASE}/reports/${r.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-medium inline-flex items-center gap-1.5 transition"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
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

