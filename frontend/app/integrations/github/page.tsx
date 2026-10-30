"use client";
import { API_BASE } from "@/lib/api";

import React, { useState, useEffect } from "react";
import {
  GitBranch,
  Play,
  CheckCircle2,
  Lock,
  ExternalLink,
  Star,
  RefreshCw
} from "lucide-react";
import GithubIcon from "@/components/GithubIcon";
import DashboardHeader from "@/components/DashboardHeader";

export default function GitHubIntegrationPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [repoUrl, setRepoUrl] = useState("https://github.com/vulnscan-demo/icream-shop");

  useEffect(() => {
    fetch(`${API_BASE}/github/repositories`)
      .then((r) => r.json())
      .then((data) => setRepos(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      const res = await fetch(`${API_BASE}/github/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl, branch: "main" })
      });
      if (res.ok) {
        alert("Repository successfully connected with automated CI/CD webhooks!");
      }
    } catch {
      alert("Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="GitHub Integration"
        subtitle="Continuous security scanning for GitHub repositories and pull requests"
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Connect Repository Card */}
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <GithubIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Connect GitHub Repository</h2>
              <p className="text-xs text-slate-400">
                Authorize VulnScan GitHub App to audit pull requests and scan commits on push.
              </p>
            </div>
          </div>

          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/organization/repository"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              disabled={connecting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              {connecting ? "Connecting..." : "Connect Repository"}
            </button>
          </form>
        </div>

        {/* Connected Repositories List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Active Integrated Repositories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{r.full_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {r.default_branch}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400" /> {r.stars}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Webhook Active
                    </span>
                  </div>
                </div>

                <a
                  href="/scans/new"
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Play className="h-3 w-3 fill-current" /> Scan Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
