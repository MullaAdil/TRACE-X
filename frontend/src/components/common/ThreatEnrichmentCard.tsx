import React, { useState } from 'react';
import {
  Globe2,
  Server,
  ShieldAlert,
  ShieldCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Lock,
  Cpu,
  Radio
} from 'lucide-react';
import { api } from '../../services/api';

interface ThreatEnrichmentCardProps {
  data: any;
  onIngested?: (evidenceId: string) => void;
}

export const ThreatEnrichmentCard: React.FC<ThreatEnrichmentCardProps> = ({ data, onIngested }) => {
  const [ingesting, setIngesting] = useState(false);
  const [ingested, setIngested] = useState(false);

  if (!data || !data.intel) return null;
  const { type, target, exists_in_case_files, intel } = data;

  const handleQuickIngest = async () => {
    setIngesting(true);
    try {
      const res = await api.ingestLiveEvidence({
        entity_type: type === 'ip' ? 'ip' : (type === 'wallet' ? 'wallet' : 'domain'),
        entity_value: target,
        context: `Live Enriched Threat Clue: ${intel.category || 'Threat Vector'} (${intel.country || 'Global'})`,
        source: 'LIVE_ENRICHMENT_SCAN'
      });
      setIngested(true);
      if (onIngested) {
        onIngested(res.evidence_id);
      }
    } catch (err: any) {
      alert(`Ingestion error: ${err.message}`);
    } finally {
      setIngesting(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ELEVATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-blue-200 shadow-md shadow-blue-500/5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            {type === 'ip' ? <Server className="w-5 h-5" /> : (type === 'wallet' ? <Coins className="w-5 h-5" /> : <Globe2 className="w-5 h-5" />)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Live Threat Intelligence
              </span>
              {exists_in_case_files ? (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Found in Case Files</span>
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  New External Lead
                </span>
              )}
            </div>
            <h3 className="text-base font-black font-mono text-slate-900 mt-0.5 select-all">
              {target}
            </h3>
          </div>
        </div>

        {/* Threat Level Badge & Ingest Action */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border ${getThreatColor(intel.threat_level)}`}>
            {intel.threat_level || 'ELEVATED'} THREAT
          </span>

          {!exists_in_case_files && !ingested && (
            <button
              onClick={handleQuickIngest}
              disabled={ingesting}
              className="btn-liquid px-4 py-2 rounded-xl text-xs font-bold space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{ingesting ? "Sealing..." : "Seal & Ingest"}</span>
            </button>
          )}

          {ingested && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sealed (SHA-256)</span>
            </span>
          )}
        </div>
      </div>

      {/* Subnet Co-Location Alert Banner (Critical Feature) */}
      {intel.has_subnet_match && (
        <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 flex items-start space-x-3 text-xs text-red-900">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Subnet Co-location Detected ({intel.subnet_cidr})
            </span>
            <p className="text-red-700 leading-relaxed font-medium">
              This suspect IP sits on the exact same hosting subnet as known campaign servers: <span className="font-mono font-bold text-red-900">{intel.colocated_case_ips.join(', ')}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Main Metadata Grid (Wide Horizontal) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Location */}
        {intel.country && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Geolocation</span>
            <div className="flex items-center space-x-1.5 pt-0.5">
              <span className="text-base">{intel.flag}</span>
              <span className="font-bold text-slate-800 truncate">
                {intel.city ? `${intel.city}, ` : ''}{intel.country}
              </span>
            </div>
          </div>
        )}

        {/* ASN / Organization */}
        {intel.isp && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Hosting Network</span>
            <span className="font-bold text-slate-800 truncate block pt-0.5" title={intel.isp}>
              {intel.asn ? `${intel.asn} ` : ''}{intel.isp}
            </span>
          </div>
        )}

        {/* Threat Classification */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Threat Classification</span>
          <span className="font-bold text-blue-700 truncate block pt-0.5">
            {intel.category || 'Suspicious Target'}
          </span>
        </div>

        {/* Risk Score */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence Risk</span>
          <div className="flex items-center space-x-2 pt-0.5">
            <span className="font-black text-sm font-mono text-slate-900">{intel.risk_score || 80}%</span>
            <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${intel.risk_score || 80}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges / Indicators Footer */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {intel.is_tor_exit && (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
            <Radio className="w-3 h-3 text-amber-600" />
            <span>Dark Web Tor Exit Relay</span>
          </span>
        )}
        {intel.is_bulletproof && (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3 text-purple-600" />
            <span>Bulletproof Offshore Host</span>
          </span>
        )}
        {intel.reverse_dns && (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-xs">
            PTR: {intel.reverse_dns}
          </span>
        )}
        {intel.campaign_link && (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Campaign: {intel.campaign_link}
          </span>
        )}
      </div>
    </div>
  );
};
