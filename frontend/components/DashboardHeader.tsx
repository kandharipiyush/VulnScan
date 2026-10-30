"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Play, RefreshCw, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  actionButton?: React.ReactNode;
}

export default function DashboardHeader({ title, subtitle, actionButton }: HeaderProps) {
  const [targetMode, setTargetMode] = useState<string>("vulnerable");
  const [toggling, setToggling] = useState<boolean>(false);

  useEffect(() => {
    checkTargetMode();
  }, []);

  const checkTargetMode = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8001/api/mode");
      if (res.ok) {
        const data = await res.json();
        setTargetMode(data.mode);
      }
    } catch {
      // ignore if demo target not running
    }
  };

  const toggleMode = async () => {
    setToggling(true);
    try {
      const res = await fetch("http://127.0.0.1:8001/api/mode/toggle", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTargetMode(data.mode);
      }
    } catch (e) {
      alert("Could not reach target at http://127.0.0.1:8001. Ensure iCream Shop is running.");
    } finally {
      setToggling(false);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-[#0d131f]/80 backdrop-blur px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* iCream Shop Target Security Mode Pill */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Target Mode:</span>
          <button
            onClick={toggleMode}
            disabled={toggling}
            className={`font-semibold px-2 py-0.5 rounded text-[11px] transition-all flex items-center gap-1 ${
              targetMode === "vulnerable"
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
            }`}
            title="Click to toggle iCream Shop security mode"
          >
            {targetMode === "vulnerable" ? (
              <>
                <AlertTriangle className="h-3 w-3" /> VULNERABLE LAB
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3" /> SECURE MODE
              </>
            )}
          </button>
          <a
            href="http://127.0.0.1:8001"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-blue-400 transition ml-1"
            title="Open iCream Shop website in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {actionButton || (
          <Link
            href="/scans/new"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> New Scan
          </Link>
        )}
      </div>
    </header>
  );
}

