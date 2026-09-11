import React, { useEffect, useState } from 'react';
import {
  Shield,
  ArrowLeft,
  Share2,
  FileCheck,
  Clock,
  ExternalLink,
  Coins,
  Bug,
  Globe2,
  KeyRound,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { EntityDetail } from '../types';

interface EntityProfilePageProps {
  entityId: number;
  onBack: () => void;
  onSelectEntity: (entityId: number) => void;
  onSelectEvidence: (evidenceId: string) => void;
  onInspectEdge?: (edge: any) => void;
}

export const EntityProfilePage: React.FC<EntityProfilePageProps> = ({
  entityId,
  onBack,
  onSelectEntity,
  onSelectEvidence,
  onInspectEdge
}) => {
  const [profile, setProfile] = useState<EntityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'relationships' | 'evidence' | 'timeline'>('relationships');

  useEffect(() => {
    setLoading(true);
    api.getEntityProfile(entityId)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [entityId]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-96 text-blue-600 text-xs font-mono font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping mr-2.5"></span>
        <span>Assembling 360° entity dossier...</span>
      </div>
    );
  }

  const { entity, evidence, relationships, connected_entities, timeline } = profile;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-600 font-bold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Previous View</span>
      </button>

      {/* Entity Dossier Header Card */}
      <div className="card-slide-stack mr-3 mb-4 p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {entity.entity_type}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 font-bold">
                {entity.canonical_id}
              </span>
              {entity.is_synthetic && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  [SYNTHETIC DEMO EVIDENCE]
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono break-all select-all tracking-tight">
              {entity.value}
            </h1>
            <p className="text-xs text-slate-500">
              Observed across {entity.source_count} independent source collections. First seen: {entity.first_seen || "Unknown"}, Last seen: {entity.last_seen || "Unknown"}.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Rating</span>
              <span className="text-lg font-mono font-extrabold text-blue-600">
                {(entity.risk_score * 10).toFixed(1)}/10
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Connected Links</span>
              <span className="text-lg font-mono font-extrabold text-slate-900">
                {relationships.length}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Evidence Records</span>
              <span className="text-lg font-mono font-extrabold text-blue-600">
                {evidence.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('relationships')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'relationships'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Connected Entities & Explanations ({relationships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'evidence'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Supporting Forensic Evidence ({evidence.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Entity Activity Timeline ({timeline.length})</span>
        </button>
      </div>

      {/* Tab 1: Relationships & Evidence Panel */}
      {activeTab === 'relationships' && (
        <div className="space-y-3">
          {relationships.length === 0 ? (
            <div className="card-slide-stack mr-3 mb-4 p-8 text-center text-xs text-slate-500">
              No direct correlated relationships recorded yet.
            </div>
          ) : (
            relationships.map((rel) => {
              const isSource = rel.source_entity_id === entity.id;
              const otherVal = isSource ? rel.target_entity_val : rel.source_entity_val;
              const otherType = isSource ? rel.target_entity_type : rel.source_entity_type;
              const otherId = isSource ? rel.target_entity_id : rel.source_entity_id;
              const scorePct = Math.round(rel.confidence_score * 100);

              return (
                <div
                  key={rel.id}
                  className="card-slide-stack mr-3 mb-4 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {rel.relationship_type}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Target: <span className="text-slate-900 font-bold">{otherVal}</span> ({otherType})
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        Confidence: {scorePct}%
                      </span>
                      <button
                        onClick={() => onSelectEntity(otherId)}
                        className="btn-liquid-secondary px-3 py-1 rounded-xl text-xs font-bold space-x-1"
                      >
                        <span>Open Target</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Forensic explanation panel */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Forensic Rationale</span>
                    {rel.explanation}
                  </div>

                  {/* Evidence IDs jump */}
                  {rel.evidence_ids && (
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Backed By:</span>
                      {rel.evidence_ids.split(',').map((eid) => (
                        <button
                          key={eid}
                          onClick={() => onSelectEvidence(eid.trim())}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                        >
                          {eid.trim()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Supporting Evidence */}
      {activeTab === 'evidence' && (
        <div className="space-y-3">
          {evidence.map((ev) => (
            <div
              key={ev.id}
              className="card-slide-stack mr-3 mb-4 p-5 flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectEvidence(ev.evidence_id)}
                    className="font-mono text-xs font-bold text-blue-600 hover:underline"
                  >
                    {ev.evidence_id}
                  </button>
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {ev.source}
                  </span>
                </div>
                <p className="text-xs text-slate-700">{ev.context}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Provenance: {ev.provenance}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-slate-400 block">{ev.timestamp}</span>
                <span className="text-xs font-mono font-bold text-blue-600">Confidence: {Math.round(ev.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="card-slide-stack mr-3 mb-4 p-6 divide-y divide-slate-100">
          {timeline.map((evt) => (
            <div key={evt.id} className="py-3.5 flex items-start justify-between space-x-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {evt.source}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                </div>
                <p className="text-xs text-slate-600">{evt.details}</p>
              </div>
              <div className="text-right shrink-0 font-mono text-xs text-slate-400">
                {evt.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
