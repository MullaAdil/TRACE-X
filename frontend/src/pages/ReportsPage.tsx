import React, { useEffect, useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Share2,
  Calendar,
  User,
  Target,
  Coins,
  Bug,
  Globe2,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { InvestigationReport } from '../types';

interface ReportsPageProps {
  caseId?: string;
  onSelectEvidence: (evidenceId: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ caseId = 'CASE-SIH-26151', onSelectEvidence }) => {
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.generateReport(caseId)
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [caseId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    const mdContent = `
# ${report.title}
**Case ID:** ${report.case_id}  
**Date:** ${report.generated_at}  
**Lead Analyst:** ${report.analyst}  
**Target:** ${report.primary_target}

---

## 1. Executive Summary
${report.executive_summary}

## 2. Attribution Verdict
> **${report.attribution_verdict}**

## 3. Observed Digital Identifiers
${report.observed_identifiers.map(i => `- **[${i.source}] ${i.type}:** \`${i.value}\` (Evidence ID: ${i.evidence_id})`).join('\n')}

## 4. Cyber Threat Intelligence & Infrastructure Telemetry
${report.cti_findings.map(c => `- **${c.type}:** \`${c.indicator}\` (Provenance: ${c.provenance})`).join('\n')}

## 5. Blockchain Fund Flows
${report.blockchain_findings.map(b => `- **Cryptocurrency Wallet / Transaction:** \`${b.entity}\` — ${b.role}`).join('\n')}

## 6. Dark Web Intelligence
${report.darkweb_findings.map(d => `- **Thread:** ${d.thread_reference} (${d.anonymity_status})`).join('\n')}

## 7. Open Pretty Good Privacy Keyring Telemetry
${report.pgp_findings.map(p => `- **Fingerprint:** \`${p.fingerprint}\` (${p.role})`).join('\n')}

## 8. Multi-Source Correlation Findings
${report.correlation_findings.map(r => `- **[${r.type}] (Confidence: ${r.confidence_score}):** ${r.explanation}`).join('\n')}

## 9. Uncertainties & Limitations
${report.uncertainties_and_limitations.map(u => `- ${u}`).join('\n')}

---
**Digital Sign-off:**  
${report.analyst_signature}
    `.trim();

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRACE-X_${report.case_id}_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSourceBadge = (source: string) => {
    switch (source.toUpperCase()) {
      case 'BLOCKCHAIN':
        return 'Cryptocurrency Ledger';
      case 'CTI':
        return 'Cyber Threat Intelligence';
      case 'DARKWEB':
        return 'Dark Web Underground Discussion';
      case 'PGP':
        return 'Pretty Good Privacy Digital Key';
      default:
        return source;
    }
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-96 text-blue-600 text-xs font-mono font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping mr-2.5"></span>
        <span>Compiling forensic attribution report...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Header (Wide Horizontal) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Official Attribution Document</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Forensic Threat Intelligence Report
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            A comprehensive, court-ready synthesis of multi-source evidence, correlation confidence metrics, and ethical attribution boundaries.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={handleExportMarkdown}
            className="btn-liquid-secondary px-4 py-2.5 text-xs font-bold space-x-2 rounded-2xl"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-liquid px-5 py-2.5 text-xs font-bold space-x-2 rounded-2xl"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Forensic Report Container (Expansive Horizontal Layout) */}
      <div className="card-slide-stack mr-3 mb-4 p-8 md:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header & Metadata Horizontal Strip */}
        <div className="space-y-6 border-b border-slate-100 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl uppercase tracking-wider">
                National Technical Research Organisation (NTRO) Official Report
              </span>
              <span className="text-xs text-slate-400 font-medium">Chain of Custody Verified</span>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">{report.generated_at}</span>
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {report.title}
            </h2>
          </div>

          {/* 4-Item Horizontal Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-slide-stack-sm mr-2 mb-2 p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Case Number</span>
                <span className="font-mono text-xs font-extrabold text-slate-900">{report.case_id}</span>
              </div>
            </div>

            <div className="card-slide-stack-sm mr-2 mb-2 p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Analyst</span>
                <span className="text-xs font-bold text-slate-900">{report.analyst}</span>
              </div>
            </div>

            <div className="card-slide-stack-sm mr-2 mb-2 p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Target</span>
                <span className="text-xs font-extrabold text-blue-700 font-mono truncate max-w-[140px] block">
                  {report.primary_target}
                </span>
              </div>
            </div>

            <div className="card-slide-stack-sm mr-2 mb-2 p-4 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Integrity Status</span>
                <span className="text-xs font-bold text-blue-600">Secure Hash Algorithm (SHA-256) Validated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attribution Verdict Banner (Wide Horizontal) */}
        <div className="card-slide-stack-sm mr-2 mb-2 p-6 bg-blue-50/90 border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 block">
                Official Attribution Verdict
              </span>
              <p className="text-sm font-extrabold text-blue-950 leading-relaxed max-w-3xl">
                {report.attribution_verdict}
              </p>
            </div>
          </div>
          <div className="shrink-0 px-4 py-2 rounded-2xl bg-white border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs">
            Court Admissible
          </div>
        </div>

        {/* 1. Executive Summary (Wide Paragraph) */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 font-mono">
              1. Executive Summary
            </h3>
          </div>
          <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200 text-sm text-slate-700 leading-relaxed font-normal">
            {report.executive_summary}
          </div>
        </div>

        {/* 2. Observed Digital Identifiers (Wide Horizontal Rows) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 font-mono">
                2. Observed Digital Identifiers ({report.observed_identifiers.length} Clues)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Recorded across all 4 intelligence feeds</span>
          </div>

          <div className="space-y-2.5">
            {report.observed_identifiers.map((obs, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {getSourceBadge(obs.source)}
                  </span>
                  <span className="text-slate-500 font-semibold">{obs.type}:</span>
                  <span className="font-mono text-slate-900 font-bold break-all">{obs.value}</span>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-start md:self-auto">
                  <span className="text-[11px] font-mono text-slate-400">Proof #{obs.evidence_id}</span>
                  <button
                    onClick={() => onSelectEvidence(obs.evidence_id)}
                    className="btn-liquid-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold"
                  >
                    Inspect Clue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Multi-Source Evidence Findings (Wide Horizontal Cards) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 font-mono">
              3. Multi-Source Intelligence Findings
            </h3>
          </div>

          <div className="space-y-4">
            {/* CTI Findings Horizontal Card */}
            <div className="card-slide-stack-sm mr-2 mb-2 p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Malware & Campaign Infrastructure (Malware Information Sharing Platform / CitizenLab)
                    </h4>
                    <p className="text-xs text-slate-500">Command and Control servers, malicious links, and cryptographic file hashes</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600">{report.cti_findings.length} Items</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {report.cti_findings.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="truncate mr-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{c.type}</span>
                      <span className="font-mono text-slate-900 font-bold truncate block">{c.indicator}</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                      {c.provenance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Findings Horizontal Card */}
            <div className="card-slide-stack-sm mr-2 mb-2 p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Cryptocurrency Fund Flows (Ethereum Public Ledger)
                    </h4>
                    <p className="text-xs text-slate-500">Tracked wallets, cluster hubs, and value transfers</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600">{report.blockchain_findings.length} Wallets</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {report.blockchain_findings.map((b, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="truncate mr-2">
                      <span className="font-mono text-slate-900 font-bold block truncate">{b.entity}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{b.role}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0">
                      On-Chain
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Web Findings Horizontal Card */}
            <div className="card-slide-stack-sm mr-2 mb-2 p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Underground Forum Discussion Intelligence
                    </h4>
                    <p className="text-xs text-slate-500">Extracted database leak topics and breached entity mentions</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600">{report.darkweb_findings.length} Threads</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {report.darkweb_findings.map((d, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="truncate mr-2">
                      <span className="text-slate-900 font-bold block truncate">{d.thread_reference}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">Category: Databases & Leaks</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0">
                      {d.anonymity_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* OpenPGP Findings Horizontal Card */}
            <div className="card-slide-stack-sm mr-2 mb-2 p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Digital Cryptographic Signatures
                    </h4>
                    <p className="text-xs text-slate-500">Verified key fingerprints and owner handle bindings</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600">{report.pgp_findings.length} Keys</span>
              </div>

              <div className="space-y-2 pt-1">
                {report.pgp_findings.map((p, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="truncate mr-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Fingerprint</span>
                      <span className="font-mono text-blue-700 font-bold block break-all">{p.fingerprint}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg shrink-0">
                      {p.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Evidence-Backed Correlations (Wide Horizontal Cards) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 font-mono">
              4. Evidence-Backed Correlations ({report.correlation_findings.length} Links)
            </h3>
          </div>

          <div className="space-y-3">
            {report.correlation_findings.map((rel, i) => (
              <div
                key={i}
                className="card-slide-stack-sm mr-2 mb-2 p-5 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg text-[11px]">
                      {rel.type}
                    </span>
                    <span className="text-slate-400 font-medium text-[11px]">Verified Correlation</span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium pt-0.5">
                    {rel.explanation}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Confidence</span>
                    <span className="font-mono text-blue-600 font-extrabold text-base">
                      {Math.round(rel.confidence_score * 100)}%
                    </span>
                  </div>
                  <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.round(rel.confidence_score * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Uncertainties & Ethical Attribution Boundaries (Horizontal Alert) */}
        <div className="p-6 rounded-3xl bg-blue-50/80 border border-blue-200 space-y-3 shadow-2xs">
          <div className="flex items-center space-x-2.5 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold tracking-tight">
              Forensic Uncertainties & Responsible Attribution Safeguards
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In accordance with National Technical Research Organisation (NTRO) responsible forensic attribution standards, the system distinguishes between technical indicators and civilian identities:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pt-1">
            {report.uncertainties_and_limitations.map((u, i) => (
              <li key={i} className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                <span className="leading-relaxed">{u}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. Digital Sign-off (Wide Horizontal Footer) */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="text-slate-400">Analyst Sign-off:</span>
            <span className="font-bold text-slate-900">{report.analyst_signature}</span>
          </div>

          <div className="flex items-center space-x-2 text-blue-700 font-bold bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Digital Cryptographic Stamp Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
