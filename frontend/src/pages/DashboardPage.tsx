import React, { useEffect, useState } from 'react';
import {
  Shield,
  FileCheck,
  Share2,
  Coins,
  Bug,
  Globe2,
  KeyRound,
  Clock,
  Search,
  ArrowUpRight,
  AlertTriangle,
  FolderLock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

interface DashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectEvidence: (evidenceId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectEvidence
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', { q: searchQuery.trim() });
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96 text-blue-600 text-xs font-mono font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping mr-2.5"></span>
        <span>Loading TRACE-X Intelligence Overview...</span>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Verified Evidence Records',
      sublabel: 'Tamper-proof records across all feeds',
      value: stats.total_evidence,
      icon: FileCheck,
      page: 'evidence'
    },
    {
      label: 'Known Targets & Accounts',
      sublabel: 'Wallets, server IPs, and hacker handles',
      value: stats.total_entities,
      icon: Shield,
      page: 'graph'
    },
    {
      label: 'Confirmed Connections',
      sublabel: 'Verified relationships between clues',
      value: stats.total_relationships,
      icon: Share2,
      page: 'graph'
    },
    {
      label: 'High-Confidence Leads',
      sublabel: 'Strong multi-source corroborated matches',
      value: stats.high_confidence_correlations_count,
      icon: CheckCircle2,
      page: 'graph'
    },
    {
      label: 'Crypto Fund Transfers',
      sublabel: 'On-chain Ethereum ledger transactions',
      value: stats.blockchain_tx_count,
      icon: Coins,
      page: 'blockchain'
    },
    {
      label: 'Malicious Server & C2 Feeds',
      sublabel: 'Packrat threat actor attack infrastructure',
      value: stats.cti_indicators_count,
      icon: Bug,
      page: 'cti'
    },
    {
      label: 'Dark Web Leak Posts',
      sublabel: 'Underground forum leak discussions',
      value: stats.darkweb_threads_count,
      icon: Globe2,
      page: 'darkweb'
    },
    {
      label: 'Active Case Files',
      sublabel: 'Assigned investigation files',
      value: stats.investigations_count,
      icon: FolderLock,
      page: 'investigations'
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Search & Mission Header (Apple Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/40 to-slate-50 border border-slate-200/90 p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRACE-X • THREAT DE-ANONYMIZATION PLATFORM</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Connect the dots. Unmask the threat.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal max-w-2xl">
            TRACE-X automatically links fragmented clues across cryptocurrency ledgers, dark web forums, and malware campaigns—building an airtight chain of evidence that anyone can understand and verify in court.
          </p>

          {/* Quick Search Box with Liquid Button */}
          <form onSubmit={handleQuickSearch} className="pt-2 flex items-center max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any suspect, crypto wallet (0x...), server IP, or website..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-l-2xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 rounded-r-2xl btn-liquid text-sm font-bold flex items-center space-x-2 shrink-0"
            >
              <span>Search</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Filter Chips (Apple Style) */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span className="font-bold text-slate-700">Quick Pivots:</span>
            <button
              onClick={() => onNavigate('search', { q: 'packrat' })}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-xs transition shadow-2xs"
            >
              Suspect: Packrat APT
            </button>
            <button
              onClick={() => onNavigate('search', { q: '0x51c72848c68a965f66fa7a88855f9f7784502a7f' })}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-xs transition shadow-2xs font-mono"
            >
              Wallet: 0x51c7...2a7f
            </button>
            <button
              onClick={() => onNavigate('search', { q: '198.12.150.249' })}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-xs transition shadow-2xs font-mono"
            >
              Server: 198.12.150.249
            </button>
            <button
              onClick={() => onNavigate('search', { q: 'CA572205C0024E06BA70BE89EAADCFFC22BD4CD5' })}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold text-xs transition shadow-2xs"
            >
              Official CIRCL Key
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Overview Metric Cards (Apple Style Horizontal Layout) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Evidence At A Glance
          </h2>
          <span className="text-xs text-slate-400">Click any card to explore</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {metricCards.map((m, i) => {
            const Icon = m.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigate(m.page)}
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0 group-hover:scale-105 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      {m.label}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {m.sublabel}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-extrabold font-mono text-slate-900 ml-3 shrink-0 group-hover:text-blue-600 transition">
                  {m.value.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Timeline Telemetry & Responsible Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Telemetry Stream (Horizontal Rows) */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Activity Stream</h2>
                <p className="text-xs text-slate-500">Live feed of verified clues and forensic events</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-1 font-bold"
            >
              <span>View Full Timeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recent_activity.map((evt) => (
              <div key={evt.id} className="py-3 flex items-center justify-between space-x-4 hover:bg-blue-50/30 -mx-3 px-3 rounded-xl transition">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
                      {evt.source}
                    </span>
                    <span className="text-sm font-bold text-slate-800 truncate">{evt.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal truncate">{evt.details || "Observed forensic event"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-semibold text-slate-400 block">{evt.timestamp}</span>
                  {evt.evidence_id && (
                    <button
                      onClick={() => onSelectEvidence(evt.evidence_id!)}
                      className="text-xs font-mono font-bold text-blue-600 hover:underline"
                    >
                      {evt.evidence_id}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible Attribution Safeguards Card (Apple Plain English) */}
        <div className="rounded-3xl bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 border border-blue-200/80 p-6 space-y-5 flex flex-col justify-between shadow-2xs">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 text-blue-900">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-slate-900">Guaranteed Safeguards</h3>
                <p className="text-xs text-slate-500">Legal rules that keep our evidence court-ready</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              TRACE-X strictly adheres to forensic standards. We never guess who a person is without certified legal proof.
            </p>

            <div className="space-y-3 text-xs text-slate-600 font-medium pt-1">
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                <span><strong>Accounts, not people:</strong> We trace where cryptocurrency moves, but never guess a human name without official bank KYC records.</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                <span><strong>No fabricated names:</strong> Dark web forum authors are masked ([AUTHOR]). We analyze what was leaked, never made-up identities.</span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                <span><strong>Verifiable benchmarks:</strong> Test every connection against verified public reference keys from European security agencies.</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="w-full py-3 btn-liquid text-xs font-bold"
          >
            Open Case Investigation Reports
          </button>
        </div>
      </div>
    </div>
  );
};
