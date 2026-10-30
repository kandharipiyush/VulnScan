"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Code2,
  Globe,
  Database,
  Cpu,
  CheckCircle,
  Lock,
  GitBranch,
  Terminal,
  Activity,
  Zap,
  Layers,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">VulnScan</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-mono border border-blue-700/50">Enterprise</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#capabilities" className="hover:text-white transition">Capabilities</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#demo-target" className="hover:text-white transition">Demo Target</a>
            <a href="#cicd" className="hover:text-white transition">CI/CD Gate</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-600/30 transition"
            >
              Launch Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.18),rgba(255,255,255,0))]"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-medium mb-6">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            Next-Gen AI Security Intelligence Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none mb-6">
            Find Vulnerabilities <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              Before Attackers Do.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Automated continuous security testing for source code, localhost applications, deployed APIs and CI/CD pipelines.
            Combine Static (SAST), Dynamic (DAST), Dependencies (SCA), and AI-powered fix verification in one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              Enter Security Console <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/scans/new"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <Terminal className="h-4 w-4 text-slate-400" /> Start New Scan
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-white">20+</div>
              <div className="text-xs text-slate-400 mt-1">Vulnerability Categories</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-emerald-400">100% Non-Destructive</div>
              <div className="text-xs text-slate-400 mt-1">Authorized Testing</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-blue-400">AI Fix Patches</div>
              <div className="text-xs text-slate-400 mt-1">Contextual Code Diffs</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="text-2xl font-bold text-violet-400">CI/CD Gate</div>
              <div className="text-xs text-slate-400 mt-1">Automated DevSecOps</div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Scanning Modes */}
      <section id="capabilities" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-2">Three Unified Ingestion Vectors</h2>
          <p className="text-3xl font-bold text-white">Comprehensive Attack Surface Coverage</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500/50 transition">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Localhost Website Scanning</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Directly scan development applications running on <code className="text-blue-300 bg-blue-950/60 px-1 py-0.5 rounded">http://localhost:3000</code> or custom local ports before pushing to version control.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Zero network egress required</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Dynamic endpoint & form crawling</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-violet-500/50 transition">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5 border border-violet-500/20">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live Website & API Auditing</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Execute controlled vulnerability checks against staging or production web URLs with strict domain authorization boundaries.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-violet-400" /> HTTP security headers & TLS checks</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-violet-400" /> Active reflected XSS & rate limit assessment</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
              <GitBranch className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">GitHub Repository & SAST</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Connect code repositories or upload source directories. Inspect unsafe SQL formatting, exposed API keys, and vulnerable third-party packages.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Static AST pattern checking (Semgrep rules)</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Secret scanning for AWS/Stripe/JWT tokens</li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Core Demonstration Workflow */}
      <section id="demo-target" className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">The Complete Remediation Cycle</span>
            <h2 className="text-3xl font-bold text-white mt-1">Featured Demo Target: iCream Shop</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
              Our artisanal e-commerce testbed with toggleable Vulnerable Lab mode and Secure mode.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d131f] border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-blue-400 mb-1">STEP 1</div>
                <div className="font-semibold text-white text-sm">Scan Target</div>
                <div className="text-[11px] text-slate-400 mt-1">http://127.0.0.1:8001</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-red-400 mb-1">STEP 2</div>
                <div className="font-semibold text-white text-sm">Detect Flaws</div>
                <div className="text-[11px] text-slate-400 mt-1">SQLi, XSS, IDOR</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-violet-400 mb-1">STEP 3</div>
                <div className="font-semibold text-white text-sm">AI Suggests Fix</div>
                <div className="text-[11px] text-slate-400 mt-1">Parameterized Diff</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-amber-400 mb-1">STEP 4</div>
                <div className="font-semibold text-white text-sm">Apply & Rescan</div>
                <div className="text-[11px] text-slate-400 mt-1">Automated Retest</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
                <div className="text-xs font-mono text-emerald-400 mb-1">STEP 5</div>
                <div className="font-semibold text-white text-sm">Generate PDF</div>
                <div className="text-[11px] text-emerald-300 mt-1">Gate: PASS</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                iCream Shop is running locally on port 8001. Toggle between modes anytime in the console.
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition"
              >
                Explore Live Demo Dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-slate-300">VulnScan Cybersecurity Platform</span>
          </div>
          <div>Find vulnerabilities before attackers do. Built for modern DevSecOps teams.</div>
          <div>&copy; 2026 VulnScan Security. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
