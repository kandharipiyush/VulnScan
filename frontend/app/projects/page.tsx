"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  Plus,
  Play,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Project Form State
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("localhost");
  const [targetUrl, setTargetUrl] = useState("http://127.0.0.1:8001");
  const [sourcePath, setSourcePath] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.log("Error loading projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          project_type: projectType,
          target_url: targetUrl,
          source_path: sourcePath,
          description,
          tech_stack: ["Python", "FastAPI", "SQLite", "HTML5"]
        })
      });
      if (res.ok) {
        setShowModal(false);
        setName("");
        fetchProjects();
      }
    } catch (e) {
      alert("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickScan = async (projectId: number) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          scan_type: "comprehensive",
          enable_sast: true,
          enable_dast: true,
          enable_sca: true,
          enable_secrets: true
        })
      });
      if (res.ok) {
        const scan = await res.json();
        router.push(`/scans/${scan.id}`);
      }
    } catch (e) {
      alert("Could not start scan");
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Project Management"
        subtitle="Manage audited web applications, repositories, and local test targets"
        actionButton={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition"
          >
            <Plus className="h-4 w-4" /> Add Project
          </button>
        }
      />

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 uppercase tracking-wider">
                      {p.project_type}
                    </span>
                    <h3 className="font-bold text-white text-base mt-2">{p.name}</h3>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    p.security_score >= 80 ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40" :
                    p.security_score >= 50 ? "bg-amber-950/40 text-amber-400 border-amber-800/40" :
                    "bg-red-950/40 text-red-400 border-red-800/40"
                  }`}>
                    {p.security_score} / 100
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {p.description || "No description provided."}
                </p>

                <div className="space-y-2 mb-4 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Target URL:</span>
                    <span className="font-mono text-slate-300">{p.target_url || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Findings:</span>
                    <span className="font-bold text-white">{p.total_findings || 0} issues</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Critical Severity:</span>
                    <span className="font-bold text-red-400">{p.critical_findings || 0}</span>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(p.tech_stack || []).map((tech: string) => (
                    <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  href="/vulnerabilities"
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  View Findings &rarr;
                </Link>
                <button
                  onClick={() => handleQuickScan(p.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Play className="h-3 w-3 fill-current" /> Start Scan
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add New Target Project</h3>
            <p className="text-xs text-slate-400 mb-5">Configure application target for automated scanning</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Next.js Web App"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scan Type</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="localhost">Localhost Website</option>
                    <option value="live_url">Live Deployed URL</option>
                    <option value="github">GitHub Repository</option>
                    <option value="upload">Local Source Directory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target URL</label>
                  <input
                    type="text"
                    placeholder="http://127.0.0.1:8001"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Source Code Path (Optional for SAST)</label>
                <input
                  type="text"
                  placeholder="c:\path\to\source or relative path"
                  value={sourcePath}
                  onChange={(e) => setSourcePath(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Internal microservice or e-commerce target..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
                >
                  {submitting ? "Creating..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

