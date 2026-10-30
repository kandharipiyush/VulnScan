"use client";
import { API_BASE } from "@/lib/api";

import React, { useState, useEffect } from "react";
import {
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Play,
  Terminal,
  Activity,
  Lock,
  RefreshCw
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

const LAB_TESTS = [
  {
    id: 1,
    title: "SQL Injection Exploitability Probe",
    category: "SQL Injection (SQLi)",
    method: "Controlled Syntax & Boolean Logic Alteration",
    payload: "' OR '1'='1' -- [SYNTHETIC TEST]",
    vulnId: 1,
    description: "Evaluates whether parameter inputs alter the database query structure in a safe, non-destructive test."
  },
  {
    id: 2,
    title: "Reflected XSS Harmless Marker Probe",
    category: "Cross-Site Scripting (XSS)",
    method: "Harmless Canary Tag Reflection",
    payload: "<vulnscan_safe_test_marker_99812>",
    vulnId: 1,
    description: "Probes web inputs to observe if unescaped tags render directly into the DOM."
  },
  {
    id: 3,
    title: "Multi-Account IDOR Boundary Validation",
    category: "Broken Access Control / IDOR",
    method: "Cross-Tenant Object Isolation Test",
    payload: "GET /api/profile?id=2 (Authenticated as Alice: ID 1)",
    vulnId: 1,
    description: "Tests whether resource endpoints verify account ownership between two synthetic test users."
  },
  {
    id: 4,
    title: "Rate Limiting & Authentication Pulse",
    category: "DDoS and Rate-Limit Weaknesses",
    method: "Low-Volume Rapid Request Pulse (6 requests)",
    payload: "POST /api/login [probe_pulse]",
    vulnId: 1,
    description: "Assesses whether authentication endpoints throttle consecutive attempts without launching denial-of-service."
  }
];

export default function SecurityValidationLabPage() {
  const [confirmedAuth, setConfirmedAuth] = useState(true);
  const [activeTest, setActiveTest] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<number, any>>({});

  const runTest = async (testItem: typeof LAB_TESTS[0]) => {
    if (!confirmedAuth) {
      alert("Please confirm target authorization before executing tests.");
      return;
    }

    setTesting(true);
    setActiveTest(testItem.id);

    try {
      const res = await fetch(`${API_BASE}/validation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vulnerability_id: testItem.vulnId,
          confirmed_authorization: confirmedAuth,
          test_mode: "NON_DESTRUCTIVE"
        })
      });

      if (!res.ok) throw new Error("Validation test execution failed");

      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [testItem.id]: data
      }));
    } catch (e: any) {
      alert(e.message || "Test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Security Validation Lab"
        subtitle="Controlled, non-destructive vulnerability confirmation against authorized targets"
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Authorization Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Authorized Target Environment</h3>
              <p className="text-xs text-slate-400">
                All validation tests use synthetic data, harmless markers, and non-destructive payloads.
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-xs">
            <input
              type="checkbox"
              checked={confirmedAuth}
              onChange={(e) => setConfirmedAuth(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
            />
            <span className="text-slate-200 font-medium">Explicit Authorization Confirmed</span>
          </label>
        </div>

        {/* Validation Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LAB_TESTS.map((t) => {
            const result = testResults[t.id];
            const isCurrentlyRunning = testing && activeTest === t.id;

            return (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 uppercase">
                        {t.category}
                      </span>
                      <h3 className="font-bold text-white text-base mt-1.5">{t.title}</h3>
                    </div>
                    {result ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950 text-red-400 border border-red-800/40">
                        {result.status}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800">
                        READY
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{t.description}</p>

                  <div className="space-y-2 mb-4 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-300">
                      <span className="text-slate-500 text-[10px] block mb-0.5">NON-DESTRUCTIVE PAYLOAD:</span>
                      <code>{t.payload}</code>
                    </div>
                  </div>

                  {/* Execution Timeline / Evidence Result */}
                  {result && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-4 space-y-2 text-xs">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Evidence Recorded
                      </div>
                      <div className="text-slate-300 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                        {result.timeline_notes}
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <strong>Response Proof:</strong> {result.response_evidence}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => runTest(t)}
                    disabled={isCurrentlyRunning}
                    className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {isCurrentlyRunning ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Executing Controlled Test...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" /> Execute Controlled Test
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

