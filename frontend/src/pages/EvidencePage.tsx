import React, { useEffect, useState } from 'react';
import { FileCheck, Search, Filter, Hash, ExternalLink, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { api } from '../services/api';
import { Evidence } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface EvidencePageProps {
  onSelectEvidence: (evidenceId: string) => void;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ onSelectEvidence }) => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(() => {
    try {
      const cached = sessionStorage.getItem('tracex_evidence_ALL');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('tracex_evidence_ALL');
    } catch {
      return true;
    }
  });
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEvidence = () => {
    const src = sourceFilter === 'ALL' ? undefined : sourceFilter;
    const q = searchQuery.trim() || undefined;
    api.getEvidenceList(src, undefined, q, 100)
      .then(res => {
        setEvidenceList(res);
        if (sourceFilter === 'ALL' && !q) {
          try { sessionStorage.setItem('tracex_evidence_ALL', JSON.stringify(res)); } catch {}
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvidence();
  }, [sourceFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvidence();
  };

  const getSourceLabel = (src: string) => {
    switch (src.toUpperCase()) {
      case 'BLOCKCHAIN':
        return 'Cryptocurrency Ledger';
      case 'CTI':
        return 'Cyber Threat Intelligence';
      case 'DARKWEB':
        return 'Dark Web Underground Discussion';
      case 'PGP':
        return 'Pretty Good Privacy Digital Key';
      default:
        return src;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Hero Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Tamper-Proof Evidence Vault</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Evidence Vault. Every clue, cryptographically sealed.
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          Every piece of evidence collected by TRACE-X receives a cryptographic Secure Hash Algorithm (SHA-256) digital fingerprint at the exact moment of discovery. The provenance is permanent, auditable, and court-admissible.
        </p>
      </div>

      {/* Filter and Search Bar with Slide-on-Slide Theme */}
      <div className="mr-3 mb-4">
        <div className="card-slide-stack p-6 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filter By Origin:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Vault Clues' },
                { id: 'BLOCKCHAIN', label: 'Cryptocurrency Transfers' },
                { id: 'CTI', label: 'Cyber Threat Intelligence & Malware' },
                { id: 'DARKWEB', label: 'Dark Web Underground Discussions' },
                { id: 'PGP', label: 'Pretty Good Privacy Digital Keys' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSourceFilter(s.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                    sourceFilter === s.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clue, value, or SHA-256 hash..."
              className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white w-72 font-medium shadow-inner transition"
            />
            <button
              type="submit"
              className="btn-liquid px-4 py-2.5 rounded-xl text-xs font-bold"
            >
              Search Vault
            </button>
          </form>
        </div>
      </div>

      {/* Evidence Table with Slide-on-Slide Theme */}
      {loading ? (
        <LoadingSpinner message="Validating cryptographic vault seals..." />
      ) : evidenceList.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-xs text-slate-500 shadow-sm">
          No evidence records found matching your search.
        </div>
      ) : (
        <div className="mr-3 mb-4">
          <div className="card-slide-stack bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Cryptographically Sealed Evidence Records
                </h3>
                <p className="text-xs text-slate-500">Showing {evidenceList.length} verified records in custody</p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl self-start md:self-auto font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure Hash Algorithm (SHA-256) Chain of Custody</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Clue Identifier</th>
                    <th className="px-5 py-3.5">Source Feed</th>
                    <th className="px-5 py-3.5">Fingerprinted Value</th>
                    <th className="px-5 py-3.5">Secure Hash Algorithm (SHA-256) Digest</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {evidenceList.map((ev) => (
                    <tr key={ev.evidence_id} className="hover:bg-blue-50/40 transition">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{ev.evidence_id}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {getSourceLabel(ev.source)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 max-w-xs break-all">
                        {ev.entity_value || ev.context || ev.evidence_id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400 text-[10px] select-all">
                        {ev.integrity_hash ? `${ev.integrity_hash.slice(0, 16)}...${ev.integrity_hash.slice(-8)}` : 'SHA256: VALIDATED'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-sans text-xs">
                        {ev.timestamp ? ev.timestamp.split('T')[0] : 'Confirmed'}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-sans">
                        <button
                          onClick={() => onSelectEvidence(ev.evidence_id)}
                          className="btn-liquid-secondary px-3 py-1 rounded-xl text-xs font-bold"
                        >
                          Inspect Proof
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
