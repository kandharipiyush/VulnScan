import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "VulnScan - AI-Powered Automated Vulnerability Detection & DevSecOps Platform",
  description: "Find vulnerabilities before attackers do. Automated SAST, DAST, SCA, Secrets Detection, and AI-assisted remediation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased flex">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
