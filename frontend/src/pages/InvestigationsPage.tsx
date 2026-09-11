import React, { useEffect, useState } from 'react';
import { FolderLock, Plus, Search, User, Calendar, ArrowRight, FileText, CheckCircle2, Shield } from 'lucide-react';
import { api } from '../services/api';
import { Investigation } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface InvestigationsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({ onNavigate }) => {
  const [cases, setCases] = useState<Investigation[]>(() => {
    try {
      const cached = sessionStorage.getItem('tracex_cases');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('tracex_cases');
    } catch {
      return true;
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [analyst, setAnalyst] = useState('Investigator Alpha');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCases = () => {
    api.getInvestigations()
      .then(res => {
        setCases(res);
        try { sessionStorage.setItem('tracex_cases', JSON.stringify(res)); } catch {}
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.createInvestigation({
        name,
        target_entity: target,
        analyst,
        description
      });
      setShowModal(false);
      setName('');
      setTarget('');
      setDescription('');
      loadCases();
    } catch (err: any) {
      alert(`Failed to create investigation: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <FolderLock className="w-3.5 h-3.5" />
            <span>Case Management System</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Case Files. Everything you need to build a solid case.
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            Organize disparate clues—crypto transfers, forum leaks, server IPs, and digital signatures—into tamper-proof case files ready for formal reporting and courtroom presentation.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-liquid px-5 py-2.5 rounded-2xl text-xs font-bold space-x-2 shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation File</span>
        </button>
      </div>

      {/* Cases List as Wide Horizontal Cards */}
      {loading ? (
        <LoadingSpinner message="Opening case files..." />
      ) : cases.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <FolderLock className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No active cases</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create an investigation file to link digital clues, assign team members, and compile formal attribution reports.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <div key={c.id} className="mr-3 mb-4">
              <div
                className="card-slide-stack p-6 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left & Middle Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                      {c.case_id}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {c.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{c.created_at?.split('T')[0] || c.created_at}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{c.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      {c.description || "Active cross-source investigation targeting digital threat infrastructure."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Search className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-700">Target Focus:</span>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {c.target_entity || "Multiple Indicators"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">Lead:</span>
                      <span className="text-slate-800 font-medium">{c.analyst}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                  <button
                    onClick={() => onNavigate('reports', { caseId: c.case_id })}
                    className="btn-liquid px-5 py-2.5 rounded-2xl text-xs font-bold space-x-2 text-center flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Report</span>
                  </button>
                  {c.target_entity && (
                    <button
                      onClick={() => onNavigate('search', { q: c.target_entity })}
                      className="btn-liquid-secondary px-4 py-2 rounded-xl text-xs font-bold space-x-1.5 text-center flex items-center justify-center"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Target</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Investigation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Open a New Case File</h3>
            <p className="text-xs text-slate-500">
              Set up a case dossier to group related digital clues, Ethereum addresses, and forensic reports together.
            </p>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Case Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Operation Packrat Cross-Chain Analysis"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Entity or Identifier</label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 0x51c72848c68a965f66fa7a88855f9f7784502a7f or Packrat"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lead Investigator</label>
                <input
                  type="text"
                  value={analyst}
                  onChange={(e) => setAnalyst(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Case Hypothesis & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the observed threat activity, suspected wallet clusters, and intended objectives..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-liquid px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Save Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
