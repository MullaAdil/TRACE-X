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
  CheckCircle2,
  FileText,
  Crosshair,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import networkIntelHero from '../assets/visuals/network_intel_hero.jpg';
import cryptoVisual from '../assets/visuals/crypto_visual.jpg';
import darkwebVisual from '../assets/visuals/darkweb_visual.jpg';
import ctiVisual from '../assets/visuals/cti_visual.jpg';
import pgpVisual from '../assets/visuals/pgp_visual.jpg';

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
      label: 'Malicious Server & Command and Control Feeds',
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
      {/* Hero Search & Mission Header with Slide-on-Slide Stacked Theme */}
      <div className="mr-3 mb-4">
        <div className="card-slide-stack relative overflow-hidden bg-gradient-to-br from-white via-blue-50/40 via-pink-50/20 to-emerald-50/20 border border-blue-200/70 p-8 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full badge-subtle-blue text-xs font-bold text-blue-700 shadow-2xs">
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

        {/* AI-Generated Forensic Command Visual Backdrop */}
        <div className="mt-6 pt-6 border-t border-slate-200/80">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-md group">
            <img
              src={networkIntelHero}
              alt="Cyber Threat Intelligence Command Center"
              className="w-full h-48 md:h-64 object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent flex items-end p-6">
              <div className="space-y-1.5 text-white bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-500/30 backdrop-blur-md border border-blue-400/40 text-[10px] font-bold tracking-wider uppercase text-blue-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Real-Time Threat Correlation Engine</span>
                </div>
                <h3 className="text-base md:text-lg font-extrabold text-white tracking-tight">
                  Global Multi-Vector Threat Attribution Matrix
                </h3>
                <p className="text-xs text-slate-200 font-normal hidden sm:block leading-relaxed">
                  Autonomous ingestion and correlation across 4 separated intelligence services: Ethereum on-chain ledgers, dark web Tor onion crawling, MISP malware indicators, and PGP digital keyrings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Separated Microservice Hubs (Each Treated as a Distinct Dedicated Service) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Separated Intelligence Services & Feeds
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            4 Standalone Microservices Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Service 1: Blockchain Intelligence */}
          <div className="mr-2 mb-2">
            <div
              onClick={() => onNavigate('blockchain')}
              className="card-slide-stack-sm p-5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer shadow-2xs group flex flex-col justify-between space-y-4 h-full"
            >
              <div className="space-y-3">
                <div className="relative h-28 rounded-2xl overflow-hidden border border-slate-200/80 mb-1 group-hover:shadow-sm bg-slate-100">
                  <img
                    src={cryptoVisual}
                    alt="Blockchain Ledger Service Visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/80 text-[10px] font-mono font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>On-Chain Tracking</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full badge-subtle-green">
                    Service 01: Cryptocurrency Ledger
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                    Blockchain Ledger Service
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Live Alchemy Remote Procedure Call mainnet tracker. Dissects wallet flows, bytecode contracts, and ERC-20 token laundering hops.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span className="font-mono">{stats.blockchain_tx_count} Verified Transactions</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Service 2: Dark Web Crawler Service */}
          <div className="mr-2 mb-2">
            <div
              onClick={() => onNavigate('darkweb')}
              className="card-slide-stack-sm p-5 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300 cursor-pointer shadow-2xs group flex flex-col justify-between space-y-4 h-full"
            >
              <div className="space-y-3">
                <div className="relative h-28 rounded-2xl overflow-hidden border border-slate-200/80 mb-1 group-hover:shadow-sm bg-slate-100">
                  <img
                    src={darkwebVisual}
                    alt="Dark Web Leak Service Visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/80 text-[10px] font-mono font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                      <span>The Onion Router (Tor) Feeds</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center font-bold">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full badge-subtle-pink">
                    Service 02: Dark Web Underground
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-pink-700 transition">
                    Dark Web Leak Service
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Monitors underground onion forums, paste repositories, database leaks, and masked actor signatures.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-pink-700">
                <span className="font-mono">{stats.darkweb_threads_count} Forum Leak Discussions</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Service 3: Threat Intelligence CTI Service */}
          <div className="mr-2 mb-2">
            <div
              onClick={() => onNavigate('cti')}
              className="card-slide-stack-sm p-5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer shadow-2xs group flex flex-col justify-between space-y-4 h-full"
            >
              <div className="space-y-3">
                <div className="relative h-28 rounded-2xl overflow-hidden border border-slate-200/80 mb-1 group-hover:shadow-sm bg-slate-100">
                  <img
                    src={ctiVisual}
                    alt="Malware & Command and Control Service Visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/80 text-[10px] font-mono font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Threat Intelligence Telemetry</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                    <Bug className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full badge-subtle-green">
                    Service 03: Cyber Threat Intelligence
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                    Malware & Command and Control Service
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Malware Information Sharing Platform (MISP) indicators of compromise. Reverse Domain Name System (DNS), Command and Control Server IP co-location, and Packrat campaign telemetry.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span className="font-mono">{stats.cti_indicators_count} Active Indicators of Compromise</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Service 4: PGP Cryptographic Identity Service */}
          <div className="mr-2 mb-2">
            <div
              onClick={() => onNavigate('pgp')}
              className="card-slide-stack-sm p-5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer shadow-2xs group flex flex-col justify-between space-y-4 h-full"
            >
              <div className="space-y-3">
                <div className="relative h-28 rounded-2xl overflow-hidden border border-slate-200/80 mb-1 group-hover:shadow-sm bg-slate-100">
                  <img
                    src={pgpVisual}
                    alt="Pretty Good Privacy Keyring Service Visual"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200/80 text-[10px] font-mono font-bold text-slate-800 flex items-center space-x-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>Luxembourg Reference Standard</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full badge-subtle-blue">
                    Service 04: Pretty Good Privacy Keyring
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition">
                    Pretty Good Privacy Digital Keyring Service
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Digital fingerprint verification. Parses armored RSA/Ed25519 blocks and benchmarks against verified reference keys.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span className="font-mono">Open Pretty Good Privacy Standard</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
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
                className="card-slide-stack-sm mr-2 mb-2 flex items-center justify-between p-4 cursor-pointer group"
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

      {/* Two Column Layout: Timeline Telemetry & Responsible Attribution with Slide-on-Slide Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Recent Telemetry Stream (with Slide-on-Slide Stacked Theme) */}
        <div className="lg:col-span-2 mr-3 mb-3">
          <div className="card-slide-stack p-6 md:p-7 space-y-4 shadow-sm">
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
                <div key={evt.id} className="py-3 flex items-center justify-between space-x-4 hover:bg-blue-50/30 -mx-2 px-2 rounded-xl transition">
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
        </div>

        {/* Responsible Attribution Safeguards (with Slide-on-Slide Stacked Theme) */}
        <div className="mr-3 mb-3">
          <div className="card-slide-stack p-6 md:p-7 space-y-5 flex flex-col justify-between shadow-sm h-full">
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
              className="w-full py-3 btn-liquid text-xs font-bold mt-4"
            >
              Open Case Investigation Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
