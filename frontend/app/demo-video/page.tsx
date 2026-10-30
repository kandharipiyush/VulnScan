"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Film,
  Mic,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

const CHAPTERS = [
  { time: 0, title: "1. Platform Overview & Landing Page", desc: "Hero presentation, architecture overview, and core scanning capabilities." },
  { time: 7, title: "2. Security Posture Dashboard", desc: "KPI metrics, Recharts severity distribution donut, and top vulnerability classes." },
  { time: 14, title: "3. Universal Ingestion Wizard", desc: "Three vectors: Localhost website, deployed live URL, and dynamic GitHub cloner." },
  { time: 20, title: "4. Live Scan Monitor & Logs", desc: "Real-time pipeline stages, file counters, and live terminal event stream." },
  { time: 26, title: "5. Vulnerability Explorer", desc: "Searchable catalog across SAST, DAST, SCA, and hardcoded secrets." },
  { time: 31, title: "6. Finding Detail & Code Diffs", desc: "Technical explanation, evidence trace, and side-by-side remediation diff." },
  { time: 37, title: "7. Security Validation Lab", desc: "Non-destructive exploitability validation in authorized environments." },
  { time: 42, title: "8. AI Security Assistant", desc: "Context-aware vulnerability analysis and automated code patch generation." },
  { time: 47, title: "9. Reports & Compliance Exports", desc: "Multi-page ReportLab PDF assessment dossier, JSON findings, and CSV exports." },
  { time: 51, title: "10. CI/CD DevSecOps Gate", desc: "STRICT and BALANCED deployment gate evaluation and GitHub Actions YAML." },
  { time: 54, title: "11. iCream Shop Demo Target", desc: "Artisanal boutique featuring interactive Vulnerable and Secure modes." },
];

export default function DemoVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(57);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current || !audioRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // Match chapter
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        if (cur >= CHAPTERS[i].time) {
          setActiveChapter(i);
          break;
        }
      }
    }
  };

  const jumpToTime = (seconds: number) => {
    if (videoRef.current && audioRef.current) {
      videoRef.current.currentTime = seconds;
      audioRef.current.currentTime = seconds;
      if (!isPlaying) {
        videoRef.current.play();
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restart = () => {
    jumpToTime(0);
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen">
      <DashboardHeader
        title="Interactive Video Demonstration & Voiceover Flow"
        subtitle="Full HD walkthrough demonstrating end-to-end vulnerability scanning, AI remediation, and DevSecOps verification"
        actionButton={
          <a
            href="/demo/vulnscan_demo_video.webm"
            download="vulnscan_demo_video.webm"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 transition"
          >
            <Download className="h-3.5 w-3.5" /> Download Video (.webm)
          </a>
        }
      />

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Main Video & Audio Player Card */}
        <div className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-2xl">
          {/* Synchronized HTML5 Video Element */}
          <div className="relative aspect-video bg-black flex items-center justify-center group">
            <video
              ref={videoRef}
              src="/demo/vulnscan_demo_video.webm"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Hidden Voiceover Audio track synchronized with video */}
            <audio ref={audioRef} src="/demo/demo_voiceover.wav" />

            {/* Center Play Overlay when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition"
              >
                <div className="h-20 w-20 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl shadow-blue-600/50 hover:scale-110 transition group-hover:bg-blue-500">
                  <Play className="h-9 w-9 fill-current ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Player Controls Bar */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="h-9 w-9 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md transition"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={restart}
                className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                title="Replay from start"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={toggleMute}
                className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                title={isMuted ? "Unmute Voiceover" : "Mute Voiceover"}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
              </button>

              <div className="text-xs font-mono text-slate-400">
                <span>00:{String(Math.floor(currentTime)).padStart(2, "0")}</span>
                <span className="mx-1">/</span>
                <span>00:{String(Math.floor(duration)).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Voiceover Active Badge */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                <Mic className="h-3 w-3 text-emerald-400 animate-pulse" /> Voiceover Synchronized
              </span>
            </div>
          </div>
        </div>

        {/* Two Columns: Interactive Chapters & Voiceover Narration Script */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Chapter Timestamps */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Film className="h-4 w-4 text-blue-400" /> Walkthrough Chapters (Click to Jump)
            </h3>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {CHAPTERS.map((ch, idx) => {
                const isActive = activeChapter === idx;
                return (
                  <div
                    key={ch.time}
                    onClick={() => jumpToTime(ch.time)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      isActive
                        ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-2">
                        <span className={`font-mono px-1.5 py-0.2 rounded text-[10px] ${
                          isActive ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                        }`}>
                          00:{String(ch.time).padStart(2, "0")}
                        </span>
                        <span>{ch.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {ch.desc}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 mt-1 ${isActive ? "text-blue-400" : "text-slate-600"}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voiceover Script & Audio Assets */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Mic className="h-4 w-4 text-emerald-400" /> Full Voiceover Narration Script
                </h3>
                <span className="text-[11px] font-mono text-slate-400">English (Neutral SAPI5)</span>
              </div>

              <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed space-y-2.5 max-h-[340px] overflow-y-auto">
                <p>&ldquo;Welcome to VulnScan, the AI-powered automated vulnerability detection, security validation, and DevSecOps platform.&rdquo;</p>
                <p>&ldquo;VulnScan unifies Static Application Security Testing, Dynamic web crawling, Dependency analysis, and hardcoded secret detection.&rdquo;</p>
                <p>&ldquo;Here on the Overview Dashboard, security teams monitor real-time security posture, severity distributions, and active findings.&rdquo;</p>
                <p>&ldquo;In the New Scan wizard, developers can scan localhost websites, live production domains, or clone any GitHub repository dynamically.&rdquo;</p>
                <p>&ldquo;As the multi-vector scan runs, the live monitor streams real-time execution logs and tracks discovered endpoints and files.&rdquo;</p>
                <p>&ldquo;In the Vulnerability Explorer, each finding provides technical evidence, CWE classifications, and side-by-side code remediation diffs.&rdquo;</p>
                <p>&ldquo;The Security Validation Lab performs non-destructive exploitability validation in authorized environments.&rdquo;</p>
                <p>&ldquo;Our AI Security Assistant explains root causes and generates parameterized patches to eliminate injection risks.&rdquo;</p>
                <p>&ldquo;Finally, VulnScan compiles executive ReportLab PDF dossiers and enforces DevSecOps deployment gates to keep releases secure.&rdquo;</p>
                <p>&ldquo;Find vulnerabilities before attackers do. Welcome to VulnScan.&rdquo;</p>
              </div>
            </div>

            {/* Direct Media Download Hub */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
              <a
                href="/demo/vulnscan_demo_video.webm"
                download="vulnscan_demo_video.webm"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition"
              >
                <Film className="h-4 w-4 text-blue-400" /> Download Video (.webm)
              </a>
              <a
                href="/demo/demo_voiceover.wav"
                download="demo_voiceover.wav"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition"
              >
                <Mic className="h-4 w-4 text-emerald-400" /> Download Audio (.wav)
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
