"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  FolderGit2,
  Scan,
  Bug,
  Crosshair,
  Bot,
  FileText,
  BarChart3,
  GitBranch,
  CheckCircle2,
  Server
} from "lucide-react";
import GithubIcon from "@/components/GithubIcon";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderGit2 },
  { label: "New Scan", href: "/scans/new", icon: Scan },
  { label: "Vulnerabilities", href: "/vulnerabilities", icon: Bug },
  { label: "Validation Lab", href: "/validation", icon: Crosshair },
  { label: "AI Security Assistant", href: "/assistant", icon: Bot },
  { label: "Reports & Exports", href: "/reports", icon: FileText },
  { label: "Security Analytics", href: "/analytics", icon: BarChart3 },
  { label: "CI/CD DevSecOps", href: "/cicd", icon: GitBranch },
  { label: "GitHub Integration", href: "/integrations/github", icon: GithubIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  // If on landing page or auth, don't show full dashboard sidebar
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-tight">VulnScan</span>
          <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">v1.0</span>
        </div>
      </div>

      {/* Target Status Indicator */}
      <div className="mx-4 my-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <Server className="h-3.5 w-3.5 text-blue-400" /> Active Target
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="font-semibold text-slate-200 truncate">iCream Shop</div>
        <div className="text-[11px] text-slate-400 mt-0.5">http://127.0.0.1:8001</div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-xs text-slate-200 border border-slate-600">
            AV
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-200 truncate">Alex Vance</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="text-blue-400 font-mono">SecOps Lead</span>
            </div>
          </div>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-200" title="Sign out / Exit">
          Exit
        </Link>
      </div>
    </aside>
  );
}
