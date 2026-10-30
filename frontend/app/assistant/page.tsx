"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  User,
  ShieldCheck,
  Sparkles,
  Terminal,
  FileCode,
  ArrowRight
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

interface Message {
  sender: "user" | "ai";
  text: string;
  patch?: string;
  time: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I am your VulnScan AI Security Assistant. I analyze your project's codebase, scanner findings, and explain root causes, threat impact, and contextual code remediation diffs.\n\nHow can I help protect your application today?",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const SUGGESTED_PROMPTS = [
    "Explain my critical SQL injection finding in login.py.",
    "How do I fix the hardcoded secrets in the codebase?",
    "Which issues are currently blocking our CI/CD deployment gate?",
    "Explain the difference between Reflected and Stored XSS."
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, vulnerability_id: 1 })
      });

      if (!res.ok) throw new Error("AI Assistant failed to respond");

      const data = await res.json();
      const aiMsg: Message = {
        sender: "ai",
        text: data.reply,
        patch: data.suggested_patch,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I am temporarily having trouble reaching the AI inference gateway. Please check that the backend is active.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pl-64 flex-1 bg-[#090d16] min-h-screen flex flex-col">
      <DashboardHeader
        title="AI Security Assistant"
        subtitle="Context-aware vulnerability analysis, root-cause explanation, and secure code generation"
      />

      <main className="p-8 max-w-5xl mx-auto flex-1 flex flex-col w-full space-y-4">
        {/* Suggested Prompts Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-violet-400" /> Prompts:
          </span>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Conversation Scroll Area */}
        <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-5 min-h-[460px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gradient-to-tr from-violet-600 to-blue-600 text-white"
              }`}>
                {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900/90 text-slate-200 border border-slate-800"
              }`}>
                <div className="whitespace-pre-line">{m.text}</div>

                {m.patch && (
                  <div className="mt-3 p-3 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    <div className="text-[10px] text-slate-500 mb-1">PROPOSED SECURE PATCH:</div>
                    <pre>{m.patch}</pre>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 mt-2 text-right">{m.time}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Bot className="h-4 w-4 animate-bounce text-violet-400" /> AI is analyzing codebase...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 bg-[#0f172a] border border-slate-800 rounded-2xl flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about vulnerabilities, remediation fixes, or CI/CD gate policies..."
            className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition"
          >
            Send <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </main>
    </div>
  );
}

