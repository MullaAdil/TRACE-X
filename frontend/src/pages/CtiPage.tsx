import React, { useEffect, useState } from 'react';
import { Bug, ShieldAlert, ExternalLink, Filter, FileCheck, Hash, Globe, Server, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { CtiOverview, CtiIndicator } from '../types';

interface CtiPageProps {
  onSelectEvidence: (evidenceId: string) => void;
}

export const CtiPage: React.FC<CtiPageProps> = ({ onSelectEvidence }) => {
  const [overview, setOverview] = useState<CtiOverview | null>(null);
  const [indicators, setIndicators] = useState<CtiIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    Promise.all([
      api.getCtiOverview(),
      api.getCtiIndicators(undefined, 200)
    ]).then(([ov, ind]) => {
      setOverview(ov);
      setIndicators(ind);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (t: string) => {
    setTypeFilter(t);
    const param = t === 'ALL' ? undefined : t;
    api.getCtiIndicators(param, 200).then(setIndicators);
  };

  const getIndicatorHumanType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'domain':
        return 'Web Domain';
      case 'ip':
        return 'Server IP';
      case 'hash':
        return 'File Digital Hash';
      case 'url':
        return 'Malicious Link';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Header with Dedicated Microservice Banner & Slide-on-Slide Theme */}
      <div className="mr-3 mb-4">
        <div className="card-slide-stack relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/30 border border-emerald-200/80 p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full badge-subtle-green text-xs font-bold">
                <Bug className="w-3.5 h-3.5 text-emerald-600" />
                <span>STANDALONE MICROSERVICE • CTI & MALWARE ATTRIBUTION</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Malware & Threat Infrastructure. Real campaigns, decoded.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                CitizenLab and MISP documented the servers, phishing domains, and malicious software used in targeted cyber campaigns. TRACE-X organizes these into tamper-proof clues that link directly to blockchain and forum evidence.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md group bg-slate-100">
                <img
                  src="/src/assets/visuals/cti_visual.jpg"
                  alt="Malware Analysis & C2 Infrastructure Visual"
                  className="w-full h-52 md:h-56 object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 text-[11px] font-mono text-slate-800 font-bold flex items-center space-x-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>MISP Threat Telemetry • C2 Beacons Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Overview Horizontal Dossier Card with Slide-on-Slide Theme */}
      {overview && (
        <div className="mr-3 mb-4">
          <div className="card-slide-stack p-6 bg-white border border-slate-200 space-y-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    Targeted Threat Actor
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Severity: {overview.threat_level}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{overview.threat_actor}</h2>
                <p className="text-xs text-slate-500 font-medium">{overview.campaign}</p>
              </div>

              <a
                href={overview.report_reference}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-liquid-secondary px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 space-x-2 self-start md:self-auto"
              >
                <span>Read CitizenLab Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Horizontal Metric Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Campaign Duration</span>
                  <span className="font-mono text-xs text-slate-800 font-bold block mt-1">
                    {overview.first_observed.split('T')[0]} — {overview.last_observed.split('T')[0]}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Observed Clues</span>
                  <span className="font-black text-lg text-blue-600 font-mono block mt-0.5">
                    {overview.total_indicators} Indicators
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Regions</span>
                <span className="text-xs text-slate-800 font-bold block mt-1">
                  {overview.targeted_regions.join(', ')}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Primary Methods</span>
                <span className="text-xs text-slate-800 font-bold block mt-1">
                  {overview.primary_tactics.slice(0, 2).join(', ')}
                </span>
              </div>
            </div>

            {/* MISP Tags in Human-friendly Format */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">Security Taxonomy Tags:</span>
              {overview.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Indicators Table with Slide-on-Slide Theme */}
      <div className="mr-3 mb-4">
        <div className="card-slide-stack bg-white border border-slate-200 overflow-hidden space-y-4 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter By Type:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'All Indicators' },
                  { id: 'domain', label: 'Domains' },
                  { id: 'ip', label: 'Server IPs' },
                  { id: 'hash', label: 'File Hashes' },
                  { id: 'url', label: 'Links' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFilterChange(f.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                      typeFilter === f.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500 font-medium">
              {indicators.length} technical clues found
            </span>
          </div>

          {/* Spacious Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Clue Reference</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Observed Technical Clue</th>
                  <th className="px-4 py-3.5">Purpose / Context</th>
                  <th className="px-4 py-3.5">Confidence</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {indicators.map((ind, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition">
                    <td className="px-4 py-3.5 font-bold text-blue-600">{ind.evidence_id}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-sans uppercase font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {getIndicatorHumanType(ind.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 font-bold break-all max-w-xs">{ind.value}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-sans text-xs font-medium">{ind.category}</td>
                    <td className="px-4 py-3.5 text-blue-600 font-bold">{Math.round(ind.confidence * 100)}%</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onSelectEvidence(ind.evidence_id)}
                        className="btn-liquid-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold"
                      >
                        View Clue Proof
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
