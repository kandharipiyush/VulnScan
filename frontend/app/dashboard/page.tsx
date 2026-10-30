"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  FolderGit2,
  Scan,
  Bug,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Activity,
  Layers
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardPage() {
  const [overview, setOverview] = useState({
    total_projects: 1,
    total_scans: 1,
    critical_vulnerabilities: 1,
    high_vulnerabilities: 4,
    fixed_vulnerabilities: 0,
    total_vulnerabilities: 6,
    average_security_score: 45
  });

  const [severityData, setSeverityData] = useState([
    { name: "Critical", value: 1, color: "#ef4444" },
    { name: "High", value: 4, color: "#f97316" },
    { name: "Medium", value: 1, color: "#f59e0b" },
    { name: "Low", value: 0, color: "#0ea5e9" },
    { name: "Info", value: 0, color: "#64748b" }
  ]);

  const [categoriesData, setCategoriesData] = useState([
    { category: "SQL Injection", count: 1 },
    { category: "Hardcoded Secrets", count: 1 },
    { category: "Dependencies (SCA)", count: 3 },
    { category: "Configuration", count: 1 }
  ]);

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [criticalFindings, setCriticalFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Overview Metrics
      const ovRes = await fetch("http://127.0.0.1:8000/api/analytics/overview");
      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData);
      }

      // 2. Fetch Severity
      const sevRes = await fetch("http://127.0.0.1:8000/api/analytics/severity");
      if (sevRes.ok) {
        const sevList = await sevRes.json();
        if (sevList.length > 0) setSeverityData(sevList);
      }

      // 3. Fetch Categories
      const catRes = await fetch("http://127.0.0.1:8000/api/analytics/categories");
      if (catRes.ok) {
        const catList = await catRes.json();
        if (catList.length > 0) setCategoriesData(catList);
      }

      // 4. Fetch Recent Scans
      const scanRes = await fetch("http://127.0.0.1:8000/api/scans");
      if (scanRes.ok) {
        const scans = await scanRes.json();
        setRecentScans(scans.slice(0, 5));
      }

      // 5. Fetch Critical & High Findings
      const vulnRes = await fetch("http://127.0.0.1:8000/api/vulnerabilities?severity=CRITICAL");
      if (vulnRes.ok) {
        const vulns = await vulnRes.json();
        setCriticalFindings(vulns);
      }
    } catch (e) {
      console.log("Using cached dashboard state:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Security Posture Overview"
        subtitle="Live automated vulnerability telemetry across connected projects and targets"
      />

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Top 6 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Projects</span>
              <FolderGit2 className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{overview.total_projects}</div>
            <div className="text-[11px] text-slate-400 mt-1">1 Live Target</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Scans</span>
              <Scan className="h-4 w-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white">{overview.total_scans}</div>
            <div className="text-[11px] text-slate-400 mt-1">Multi-vector checks</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-red-900/40 bg-red-950/10">
            <div className="flex items-center justify-between text-red-300 text-xs mb-2">
              <span>Critical</span>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-400">{overview.critical_vulnerabilities}</div>
            <div className="text-[11px] text-red-400/80 mt-1">Blocks CI/CD Gate</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-orange-900/40 bg-orange-950/10">
            <div className="flex items-center justify-between text-orange-300 text-xs mb-2">
              <span>High Risk</span>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-400">{overview.high_vulnerabilities}</div>
            <div className="text-[11px] text-orange-400/80 mt-1">Immediate action</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-emerald-900/40 bg-emerald-950/10">
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-2">
              <span>Verified Fixed</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{overview.fixed_vulnerabilities}</div>
            <div className="text-[11px] text-emerald-400/80 mt-1">Retested & resolved</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f172a] border border-blue-900/40 bg-blue-950/10">
            <div className="flex items-center justify-between text-blue-300 text-xs mb-2">
              <span>Security Score</span>
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">{overview.average_security_score} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
            <div className="text-[11px] text-blue-300/80 mt-1">Posture rating</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart: Severity Distribution */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-blue-400" /> Severity Breakdown
              </h3>
              <Link href="/vulnerabilities" className="text-xs text-blue-400 hover:underline">
                View All &rarr;
              </Link>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-2 flex-wrap">
              {severityData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                  <span className="text-slate-400">{s.name}: <strong className="text-white">{s.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Categories Distribution */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-violet-400" /> Top Vulnerability Classes
              </h3>
              <span className="text-xs text-slate-400">OWASP / CWE Classification</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lower Row: Recent Scan Jobs & Critical Findings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Scans */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" /> Recent Scans
              </h3>
              <Link href="/scans/new" className="text-xs text-blue-400 hover:underline">
                New Scan &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {recentScans.length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">No scans recorded yet.</div>
              ) : (
                recentScans.map((s) => (
                  <Link
                    key={s.id}
                    href={`/scans/${s.id}`}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition block"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-2">
                        <span>Scan #{s.id}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 font-mono">
                          {s.scan_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Stage: {s.current_stage} &bull; Findings: {s.findings_count}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        s.status === "COMPLETED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : "bg-amber-950 text-amber-400"
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Critical Vulnerabilities Requiring Action */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400" /> Active Critical Findings
              </h3>
              <Link href="/vulnerabilities" className="text-xs text-red-400 hover:underline">
                Explore All &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {criticalFindings.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center">
                  <CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-slate-300">No Critical Findings Open</div>
                  <div className="text-[11px] text-slate-400 mt-1">Your application passes strict deployment gates.</div>
                </div>
              ) : (
                criticalFindings.map((v) => (
                  <Link
                    key={v.id}
                    href={`/vulnerabilities/${v.id}`}
                    className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 hover:border-red-500/40 transition block"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-xs text-red-300 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-900/60 text-red-200 font-bold">
                            CRITICAL
                          </span>
                          <span>{v.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          File: <code className="text-slate-300">{v.file_path || v.endpoint}</code>
                        </div>
                      </div>
                      <span className="text-xs text-blue-400 hover:text-blue-300 font-medium">Fix &rarr;</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

