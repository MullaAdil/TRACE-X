import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  Shield,
  FileCheck,
  AlertCircle,
  Plus,
  Sparkles,
  ExternalLink,
  Coins,
  Bug,
  Globe2,
  KeyRound
} from 'lucide-react';
import { api } from '../services/api';
import { SearchResultItem } from '../types';
import { ThreatEnrichmentCard } from '../components/common/ThreatEnrichmentCard';

interface SearchPageProps {
  initialQuery?: string;
  onSelectEntity: (entityId: number) => void;
  onSelectEvidence: (evidenceId: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  onSelectEntity,
  onSelectEvidence
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [enrichment, setEnrichment] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Live Ingest Modal State
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestType, setIngestType] = useState('ip');
  const [ingestVal, setIngestVal] = useState('');
  const [ingestContext, setIngestContext] = useState('');
  const [ingesting, setIngesting] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const [searchRes, enrichRes] = await Promise.allSettled([
        api.search(q.trim()),
        api.getEnrichment(q.trim())
      ]);

      if (searchRes.status === 'fulfilled') {
        setResults(searchRes.value.results);
      } else {
        setResults([]);
      }

      if (enrichRes.status === 'fulfilled') {
        setEnrichment(enrichRes.value);
      } else {
        setEnrichment(null);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      setEnrichment(null);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleOpenIngest = (prefill?: string) => {
    setIngestVal(prefill || query || '');
    setIngestContext(prefill ? `New live investigation target '${prefill}' added by analyst` : '');
    setShowIngestModal(true);
  };

  const handleLiveIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestVal.trim()) return;
    setIngesting(true);
    try {
      await api.ingestLiveEvidence({
        entity_type: ingestType,
        entity_value: ingestVal.trim(),
        context: ingestContext || `Investigator live target: ${ingestVal.trim()}`,
        source: 'LIVE_INVESTIGATION_INPUT'
      });
      setShowIngestModal(false);
      setQuery(ingestVal.trim());
      performSearch(ingestVal.trim());
    } catch (err: any) {
      alert(`Ingestion failed: ${err.message}`);
    } finally {
      setIngesting(false);
    }
  };

  const sampleChips = [
    { label: "Packrat Threat Actor", q: "packrat" },
    { label: "Ethereum Wallet", q: "0x51c72848c68a965f66fa7a88855f9f7784502a7f" },
    { label: "C2 IP Infrastructure", q: "198.12.150.249" },
    { label: "Phishing Domain", q: "support-java.com" },
    { label: "Payload MD5 Hash", q: "dd1101adc86fd282f5f183942cc2f3b7" },
    { label: "CIRCL PGP Key", q: "CA572205C0024E06BA70BE89EAADCFFC22BD4CD5" },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header (Apple Style) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Search className="w-5 h-5" />
            </div>
            <span>Universal Search Across All Datasets</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search any clue—such as a crypto wallet, server IP, domain, malware hash, or alias. TRACE-X instantly scours all connected forensic datasets.
          </p>
        </div>

        {/* Live Indicator Ingestion Button */}
        <button
          onClick={() => handleOpenIngest()}
          className="btn-liquid px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Target Clue</span>
        </button>
      </div>

      {/* Main Search Input */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by alias, domain, IP, hash, wallet address, PGP fingerprint, or thread ID..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-medium shadow-inner transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-liquid px-6 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2 shrink-0 disabled:opacity-50"
          >
            <span>Execute Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400 mr-1">Loaded Case Indicators:</span>
          {sampleChips.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(c.q);
                performSearch(c.q);
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-xs font-mono font-semibold transition"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-blue-600 text-xs font-mono font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping mr-2.5"></span>
          <span>Running threat intelligence & cross-dataset lookup...</span>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="space-y-4">
          {/* Live Threat Enrichment Card (Even when 0 local records exist!) */}
          {enrichment && (
            <ThreatEnrichmentCard
              data={enrichment}
              onIngested={() => performSearch(query)}
            />
          )}

          {/* Empty Search Result with Ingest Prompt */}
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">
                Not yet registered in local case evidence: <span className="text-blue-600 font-mono">"{query}"</span>
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Use the Live Threat Intelligence Card above to inspect real-time geolocation, ASN network, and threat vectors, or click below to seal it into the repository.
              </p>
            </div>

            <button
              onClick={() => handleOpenIngest(query)}
              className="btn-liquid inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest "{query}" as Live Case Target</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Live Threat Enrichment Card on matched entities */}
          {enrichment && (
            <ThreatEnrichmentCard data={enrichment} />
          )}

          {searched && (
            <div className="text-xs text-slate-500 px-1 font-mono font-semibold flex items-center justify-between">
              <span>Found {results.length} matching entities across loaded repositories</span>
              <button
                onClick={() => handleOpenIngest()}
                className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-bold"
              >
                + Ingest another indicator
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3">
            {results.map((item) => (

              <div
                key={item.entity_id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 border border-blue-200 text-blue-700">
                      {item.source}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.entity_type}
                    </span>
                    {item.is_synthetic && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        [SYNTHETIC DEMO]
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-mono break-all">{item.value}</h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">{item.context}</p>
                </div>

                <div className="flex items-center space-x-5 shrink-0 md:border-l md:border-slate-100 md:pl-5">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
                    <span className="text-sm font-mono font-extrabold text-emerald-600">
                      {Math.round(item.confidence * 100)}%
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {item.connected_count} connected links
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <button
                      onClick={() => onSelectEntity(item.entity_id)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold font-mono transition"
                    >
                      <span>360° Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {item.evidence_id && (
                      <button
                        onClick={() => onSelectEvidence(item.evidence_id!)}
                        className="text-xs font-mono font-semibold text-slate-400 hover:text-blue-600 text-center"
                      >
                        {item.evidence_id}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingest Live Indicator Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-7 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Ingest Live Indicator / Target</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Add an unindexed suspect, wallet, domain, or IP directly to the active investigation database. The correlation engine will immediately calculate its graph connections and confidence score.
            </p>

            <form onSubmit={handleLiveIngestSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Indicator Type
                </label>
                <select
                  value={ingestType}
                  onChange={(e) => setIngestType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="ip">IP Address (C2 / Hosting)</option>
                  <option value="wallet">Cryptocurrency Wallet (ETH / BTC)</option>
                  <option value="domain">Domain / Hostname</option>
                  <option value="alias">Dark Web Alias / Threat Actor Handle</option>
                  <option value="hash">File Hash (MD5 / SHA256)</option>
                  <option value="email">Email Address</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Indicator Value
                </label>
                <input
                  type="text"
                  required
                  value={ingestVal}
                  onChange={(e) => setIngestVal(e.target.value)}
                  placeholder="e.g. 198.12.150.249, 0x51c72..., shadow_admin"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                  Forensic Context / Lead Source
                </label>
                <textarea
                  rows={2}
                  value={ingestContext}
                  onChange={(e) => setIngestContext(e.target.value)}
                  placeholder="e.g. Discovered in darkweb paste, ransom demand note, or external honeypot alert"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="btn-liquid px-6 py-2.5 rounded-xl text-xs font-bold font-mono disabled:opacity-50"
                >
                  {ingesting ? 'Correlating...' : 'Ingest & Correlate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
