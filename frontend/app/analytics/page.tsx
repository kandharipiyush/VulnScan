"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Shield,
  Layers,
  Filter
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

export default function SecurityAnalyticsPage() {
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const sRes = await fetch("http://127.0.0.1:8000/api/analytics/severity");
      if (sRes.ok) setSeverityData(await sRes.json());

      const cRes = await fetch("http://127.0.0.1:8000/api/analytics/categories");
      if (cRes.ok) setCategoryData(await cRes.json());

      const tRes = await fetch("http://127.0.0.1:8000/api/analytics/trends");
      if (tRes.ok) setTrendsData(await tRes.json());
    } catch (e) {
      console.log("Analytics fetch notice:", e);
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Security Analytics & Metrics"
        subtitle="Historical vulnerability telemetry, engine detection distributions, and trend analysis"
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Timeframe Filter Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <Filter className="h-4 w-4 text-blue-400" /> Filter Time Horizon:
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "all"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                  timeframe === t ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Row 1: Donut & Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Donut */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-blue-400" /> Severity Concentration
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, idx) => (
                      <Cell key={`sev-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-3 flex-wrap">
              {severityData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                  <span className="text-slate-400">{s.name}: <strong className="text-white">{s.value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Bar */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-400" /> Distribution by Vulnerability Category
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Trend Over Time Line Chart */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Scan Audit Finding Trajectory Over Time
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="scan" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
                <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} name="High" />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Findings" />
                <Line type="monotone" dataKey="fixed" stroke="#10b981" strokeWidth={2} name="Fixed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

