"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bug,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  FileCode,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVulnerabilities();
  }, [selectedSeverity, selectedSource]);

  const fetchVulnerabilities = async () => {
    try {
      let url = "http://127.0.0.1:8000/api/vulnerabilities?";
      if (selectedSeverity !== "ALL") {
        if (selectedSeverity === "FIXED") {
          url += "status=FIXED&";
        } else {
          url += `severity=${selectedSeverity}&`;
        }
      }
      if (selectedSource !== "ALL") {
        url += `source=${selectedSource}&`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVulnerabilities(data);
      }
    } catch (e) {
      console.log("Error fetching vulnerabilities:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredVulns = vulnerabilities.filter((v) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      v.title.toLowerCase().includes(s) ||
      (v.cwe && v.cwe.toLowerCase().includes(s)) ||
      (v.file_path && v.file_path.toLowerCase().includes(s)) ||
      (v.category && v.category.toLowerCase().includes(s))
    );
  });

  const getSeverityBadge = (sev: string, status: string) => {
    if (status === "FIXED") {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
          FIXED
        </span>
      );
    }
    switch (sev) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-950 text-red-400 border border-red-800/40">
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-950 text-orange-400 border border-orange-800/40">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800/40">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-400 border border-blue-800/40">
            {sev}
          </span>
        );
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Vulnerability Explorer"
        subtitle="Catalog of identified security risks, CWE mapping, and remediation state"
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Filters & Search Toolbar */}
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, CWE, CVE, or file..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Severity Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "FIXED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedSeverity(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedSeverity === tab
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Detection Source Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="ALL">All Engines</option>
              <option value="SAST">SAST (Code)</option>
              <option value="DAST">DAST (Runtime)</option>
              <option value="SCA">SCA (Dependencies)</option>
              <option value="SECRETS">Secrets</option>
            </select>
          </div>
        </div>

        {/* Findings Table */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Finding Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">CWE / CVE</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVulns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No matching vulnerabilities found.
                    </td>
                  </tr>
                ) : (
                  filteredVulns.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSeverityBadge(v.severity, v.status)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <Link href={`/vulnerabilities/${v.id}`} className="hover:text-blue-400 transition">
                          {v.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {v.category}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 max-w-[200px] truncate" title={v.file_path || v.endpoint}>
                        {v.file_path || v.endpoint || "N/A"}
                        {v.line_number ? `:${v.line_number}` : ""}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {v.detection_source}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {v.cwe || v.cve || "-"}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === "FIXED" ? "bg-emerald-950 text-emerald-400" :
                          v.status === "CONFIRMED" ? "bg-red-950 text-red-300" :
                          "bg-slate-800 text-slate-300"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/vulnerabilities/${v.id}`}
                          className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-medium inline-flex items-center gap-1 transition"
                        >
                          Details <ChevronRight className="h-3 w-3" />
                        </Link>
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

