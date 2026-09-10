import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Hash, Link as LinkIcon, Calendar, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

interface EvidenceDrawerProps {
  evidenceId: string | null;
  onClose: () => void;
  onSelectEntity?: (entityId: number) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidenceId, onClose, onSelectEntity }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!evidenceId) return;
    setLoading(true);
    api.getEvidenceDetail(evidenceId)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [evidenceId]);

  if (!evidenceId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 md:w-[520px] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight font-mono">{evidenceId}</h2>
            <p className="text-[10px] text-slate-400 font-medium">Forensic Chain of Custody & Provenance</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-xs text-blue-600 font-bold font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping mr-2"></span>
            <span>Retrieving forensic record...</span>
          </div>
        ) : data ? (
          <>
            {/* Source & Entity Badge */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Originating Source</span>
                <span className="text-xs font-extrabold text-blue-600 font-mono">{data.evidence.source}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Entity Classification</span>
                <span className="text-xs font-extrabold text-slate-800 font-mono">{data.evidence.entity_type}</span>
              </div>
            </div>

            {/* Target Value */}
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Entity Identifier Value</span>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 font-mono text-xs text-slate-900 break-all select-all font-bold shadow-2xs">
                {data.evidence.entity_value}
              </div>
            </div>

            {/* Context & Description */}
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Investigative Context</span>
              <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs">
                {data.evidence.context || "No explicit narrative context recorded."}
              </div>
            </div>

            {/* Chain of Custody Box */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 text-xs shadow-2xs">
              <span className="text-[11px] uppercase font-bold text-blue-600 block">Cryptographic Chain of Custody</span>
              
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center space-x-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>Collection Date:</span></span>
                <span className="font-mono text-slate-800 font-bold">{data.chain_of_custody.collection_timestamp || "Unknown"}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="flex items-center space-x-1.5"><LinkIcon className="w-3.5 h-3.5 text-slate-400" /><span>Provenance:</span></span>
                <span className="text-slate-800 font-medium truncate max-w-[240px]">{data.chain_of_custody.provenance}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>SHA-256 Integrity Hash:</span>
                </span>
                <div className="p-2 bg-slate-50 rounded-xl font-mono text-[10px] text-blue-700 font-bold break-all border border-slate-200">
                  {data.chain_of_custody.integrity_hash_sha256 || "N/A"}
                </div>
              </div>
            </div>

            {/* Corroborating Relationships */}
            {data.corroborating_relationships && data.corroborating_relationships.length > 0 && (
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-500 block mb-2">
                  Corroborating Relationships ({data.corroborating_relationships.length})
                </span>
                <div className="space-y-2">
                  {data.corroborating_relationships.map((rel: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">{rel.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold font-mono border border-blue-200">
                          Conf: {rel.confidence}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{rel.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jump to Entity Profile */}
            {data.associated_entity && data.associated_entity.id && (
              <button
                onClick={() => {
                  if (onSelectEntity) onSelectEntity(data.associated_entity.id);
                  onClose();
                }}
                className="w-full btn-liquid py-3 text-xs font-bold space-x-2"
              >
                <span>Open 360° Entity Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-xs text-slate-500 py-12">Evidence not found.</div>
        )}
      </div>
    </div>
  );
};
