import React from 'react';
import { X, Network, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { GraphEdge } from '../../types';

interface EdgeRationaleModalProps {
  edge: GraphEdge | null;
  onClose: () => void;
  onSelectEvidence: (evidenceId: string) => void;
}

export const EdgeRationaleModal: React.FC<EdgeRationaleModalProps> = ({ edge, onClose, onSelectEvidence }) => {
  if (!edge) return null;

  const scorePct = Math.round(edge.confidence * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Relationship Provenance Inspector</h3>
              <p className="text-[10px] text-slate-400 font-medium">Why does TRACE-X correlate these entities?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Edge Type & Confidence Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Relationship Type</span>
              <span className="text-sm font-mono font-bold text-blue-700">{edge.relationship}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Correlation Confidence</span>
              <span className="text-sm font-mono font-extrabold text-blue-600">
                {scorePct}% ({edge.confidence})
              </span>
            </div>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${scorePct}%` }}
              ></div>
            </div>
          </div>

          {/* Explanation Rationale */}
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1.5">
              Forensic Explanation & Matching Rationale
            </span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
              {edge.explanation}
            </div>
          </div>

          {/* Supporting Evidence Chain */}
          {edge.evidence_ids && edge.evidence_ids.length > 0 && (
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1.5">
                Supporting Evidence IDs ({edge.evidence_ids.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {edge.evidence_ids.map((eid) => (
                  <button
                    key={eid}
                    onClick={() => {
                      onSelectEvidence(eid);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-mono text-xs font-bold transition"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{eid}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attribution Warning Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-blue-900 block">Attribution Boundary Notice:</span>
            <p className="leading-relaxed">
              Relationship correlation scores reflect mathematical similarity, structural graph proximity, and threat intelligence overlap. Physical real-world identity requires external KYC or court-ordered subpoena verification.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full btn-liquid py-2.5 rounded-xl text-xs font-bold"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
