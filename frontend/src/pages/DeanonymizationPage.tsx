import React, { useEffect, useState } from 'react';
import {
  Crosshair,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Unlock,
  KeyRound,
  Globe2,
  Coins,
  FileText,
  UserCheck,
  Share2,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface DeanonymizationPageProps {
  onNavigateToGraph: (entityVal?: string) => void;
  onNavigateToEvidence: (evidenceId: string) => void;
  onNavigateToReports: () => void;
}

export const DeanonymizationPage: React.FC<DeanonymizationPageProps> = ({
  onNavigateToGraph,
  onNavigateToReports
}) => {
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('packrat');
  const [pipelineData, setPipelineData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  const loadTargets = async () => {
    try {
      setLoading(true);
      const data = await api.getDeanonymizationTargets();
      setTargets(data);
      if (data.length > 0 && !selectedTargetId) {
        setSelectedTargetId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const loadPipeline = async (targetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDeanonymizationTarget(targetId);
      setPipelineData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load de-anonymization pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();
  }, []);

  useEffect(() => {
    if (selectedTargetId) {
      loadPipeline(selectedTargetId);
    }
  }, [selectedTargetId]);

  const getStageIcon = (stageNum: number) => {
    switch (stageNum) {
      case 1:
        return <Globe2 className="w-5 h-5" />;
      case 2:
        return <KeyRound className="w-5 h-5" />;
      case 3:
        return <Shield className="w-5 h-5" />;
      case 4:
        return <Coins className="w-5 h-5" />;
      case 5:
        return <UserCheck className="w-5 h-5" />;
      default:
        return <Crosshair className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> ATTRIBUTION COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" /> IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Lock className="w-3 h-3 mr-1 text-rose-600" /> JUDICIAL LEGAL SUBPOENA REQUIRED
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Problem Statement & De-anonymization Header with Slide-on-Slide Theme */}
      <div className="mr-3 mb-4">
        <div className="card-slide-stack relative overflow-hidden bg-gradient-to-br from-white via-blue-50/40 via-pink-50/20 to-emerald-50/20 border border-blue-200/80 rounded-3xl p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full badge-subtle-blue text-xs font-bold mb-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span>NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) PROBLEM ID: SIH26151</span>
                <span>•</span>
                <span className="text-slate-600">DE-ANONYMIZATION ENGINE</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Crosshair className="w-6 h-6" />
                </div>
                Unmasking Dark Web Adversaries
              </h1>
              <p className="text-sm text-slate-600 mt-2.5 max-w-3xl leading-relaxed font-normal">
                Connect anonymous forum posts, encryption keys, server networks, and cryptocurrency trails into an airtight case that holds up in court.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateToGraph()}
                  className="btn-liquid-secondary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Interactive Map</span>
                </button>
                <button
                  onClick={onNavigateToReports}
                  className="btn-liquid px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Official Report</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md group bg-slate-100">
                <img
                  src="/src/assets/visuals/deanonymize_visual.jpg"
                  alt="De-anonymization Command Interface"
                  className="w-full h-52 md:h-56 object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 text-[11px] font-mono text-slate-800 font-bold flex items-center space-x-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span>Multimodal Unmasking Matrix Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Selection Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              Active Target:
            </span>
            {targets.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTargetId(t.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2.5 border ${
                  selectedTargetId === t.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedTargetId === t.id ? 'bg-white animate-pulse' : 'bg-slate-300'
                  }`}
                ></span>
                <span>{t.name}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                  selectedTargetId === t.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {t.deanonymization_progress}% Solved
                </span>
              </button>
            ))}
          </div>

          {/* Dynamic Target Input Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2">
            <div className="relative flex-1">
              <Crosshair className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Analyze any wallet address (0x...), Command and Control IP (198.12...), domain, or alias dynamically..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) setSelectedTargetId(val);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
            <button
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement);
                if (input && input.value.trim()) {
                  setSelectedTargetId(input.value.trim());
                }
              }}
              className="btn-liquid px-4 py-2 rounded-xl text-xs font-bold shrink-0"
            >
              Analyze Target
            </button>
          </div>
        </div>
      </div>

      {loading && !pipelineData ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500">
            Reconstructing the de-anonymization chain...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
          {error}
        </div>
      ) : pipelineData ? (
        <>
          {/* Target Assessment 4 Metric Cards with Slide-on-Slide Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="mr-2 mb-2">
              <div className="card-slide-stack-sm bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-2xs h-full">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Identity Solved
                  </span>
                  <div className="text-2xl font-extrabold text-blue-600 font-mono">
                    {pipelineData.overall_progress_pct}%
                  </div>
                  <div className="text-[11px] text-slate-500">Digital cluster complete</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Crosshair className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="mr-2 mb-2">
              <div className="card-slide-stack-sm bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-2xs h-full">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Confidence Score
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">
                    {(pipelineData.attribution_confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-blue-700 font-bold">Multi-source verified</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="mr-2 mb-2">
              <div className="card-slide-stack-sm bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-2xs h-full">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Security Mistakes
                  </span>
                  <div className="text-2xl font-extrabold text-blue-600 font-mono">
                    {pipelineData.opsec_vulnerabilities?.length || 0} Leaks
                  </div>
                  <div className="text-[11px] text-slate-500">Adversary Operations Security (OPSEC) errors</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="mr-2 mb-2">
              <div className="card-slide-stack-sm bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-2xs h-full">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Legal Status
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">
                    {pipelineData.target_id === 'demo_persona_omega' ? 'Subpoena Validated' : 'Ready For Subpoena'}
                  </div>
                  <div className="text-[11px] text-slate-500">Requires judicial Know-Your-Customer (KYC) warrant</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Lock className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
          {/* 5-Stage Progressive De-anonymization Ladder (Horizontal Step Timeline) with Slide-on-Slide Theme */}
          <div className="mr-3 mb-4">
            <div className="card-slide-stack bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Unlock className="w-6 h-6 text-blue-600" />
                    5-Step Progressive Unmasking Process
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    How TRACE-X takes you step-by-step from an anonymous dark web post to a confirmed real-world identity.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
                  {pipelineData.title}
                </span>
              </div>

              {/* Step Ladder Cards with Fluid Connectors */}
              <div className="relative">
                {/* Fluid SVG Connector Curve (Desktop) */}
                <div className="hidden md:block absolute top-10 left-8 right-8 h-2 z-0 pointer-events-none">
                  <svg className="w-full h-2" preserveAspectRatio="none">
                    <line
                      x1="0"
                      y1="4"
                      x2="100%"
                      y2="4"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      className="fluid-connector-line"
                    />
                  </svg>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                  {pipelineData.stages.map((stage: any, idx: number) => {
                    const isSelected = activeStageIndex === idx;
                    const isCompleted = stage.status === 'COMPLETED';
                    const isInProgress = stage.status === 'IN_PROGRESS';

                    return (
                      <button
                        key={stage.stage_num}
                        onClick={() => setActiveStageIndex(idx)}
                        className={`text-left p-5 rounded-2xl border transition-all duration-200 relative bg-white ${
                          isSelected
                            ? 'border-blue-500 ring-4 ring-blue-500/15 shadow-md scale-[1.02]'
                            : isCompleted
                            ? 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                            : 'border-slate-200/80 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                : isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isInProgress
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {stage.stage_num}
                          </div>
                          {getStatusBadge(stage.status)}
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 truncate mb-1">
                          {stage.stage_name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {stage.summary || stage.description}
                        </p>

                        {idx < pipelineData.stages.length - 1 && (
                          <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Stage Detailed Breakdown Panel */}
              {pipelineData.stages[activeStageIndex] && (
                <div className="bg-slate-50/70 border border-slate-200 rounded-3xl p-7 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm shadow-blue-500/25">
                        {getStageIcon(pipelineData.stages[activeStageIndex].stage_num)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-blue-700">
                            STAGE 0{pipelineData.stages[activeStageIndex].stage_num} OF 05
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-500">
                            {pipelineData.stages[activeStageIndex].status}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900">
                          {pipelineData.stages[activeStageIndex].stage_name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateToGraph()}
                      className="btn-liquid-secondary px-4 py-2 text-xs font-mono font-bold flex items-center space-x-2"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Explore Stage In Graph</span>
                    </button>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {pipelineData.stages[activeStageIndex].summary || pipelineData.stages[activeStageIndex].description}
                  </p>

                  {/* Evidence / Indicators associated with this stage */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Key Forensic Indicators in This Stage ({(pipelineData.stages[activeStageIndex].evidence_items || pipelineData.stages[activeStageIndex].indicators || []).length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(pipelineData.stages[activeStageIndex].evidence_items || pipelineData.stages[activeStageIndex].indicators || []).map((ind: any, i: number) => (
                        <div
                          key={i}
                          className="card-slide-stack-sm mr-2 mb-2 p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {ind.type}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">
                              {ind.source}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-slate-900 break-all font-bold select-all bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            {ind.value}
                          </div>
                          {(ind.detail || ind.evidence_id) && (
                            <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
                              <span>{ind.detail || 'Verified Case Evidence'}</span>
                              {ind.evidence_id && (
                                <span className="font-mono text-[10px] text-blue-600 font-bold">{ind.evidence_id}</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OPSEC Vulnerability Analysis Panel with Slide-on-Slide Theme */}
          <div className="mr-3 mb-4">
            <div className="card-slide-stack bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <AlertTriangle className="w-6 h-6 text-blue-600" />
                  Adversary Security Mistakes & Leak Points
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  How simple human blunders by the threat actor enabled TRACE-X to bridge the darkweb anonymity gap.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(pipelineData.opsec_vulnerabilities || []).map((v: any, idx: number) => (
                  <div
                    key={idx}
                    className="card-slide-stack-sm mr-2 mb-2 p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        {v.title || v.failure}
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {v.severity} LEAK
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {v.impact || v.forensic_impact}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Failure Vector:</span>
                      <span className="text-blue-700 font-bold font-mono text-[11px]">{v.vector || 'INFRASTRUCTURE_REUSE'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attribution Explanation & Methodology Notice with Slide-on-Slide Theme */}
          <div className="mr-3 mb-4">
            <div className="card-slide-stack p-6 bg-blue-50/60 border border-blue-200 rounded-3xl text-xs text-slate-700 space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Attribution Evidentiary Principles</span>
              </div>
              <p className="leading-relaxed">
                Under National Technical Research Organisation (NTRO) operational guidelines, correlating Internet Protocol (IP) addresses, web domains, malware cryptographic hashes, and cryptocurrency wallets forms a{' '}
                <strong className="text-blue-800 font-bold">Confirmed Digital Cluster</strong>.
                Real-world physical identity is never guessed or fabricated; it is confirmed exclusively through authorized judicial Know-Your-Customer (KYC) orders or cryptographic key escrow anchors.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
