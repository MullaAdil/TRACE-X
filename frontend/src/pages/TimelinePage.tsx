import React, { useEffect, useState } from 'react';
import { Clock, Filter, Search, Calendar, FileCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { TimelineEvent } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface TimelinePageProps {
  onSelectEvidence: (evidenceId: string) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ onSelectEvidence }) => {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    try {
      const cached = sessionStorage.getItem('tracex_timeline_ALL');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('tracex_timeline_ALL');
    } catch {
      return true;
    }
  });
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('');

  const loadTimeline = () => {
    const src = sourceFilter === 'ALL' ? undefined : sourceFilter;
    const ent = entityFilter.trim() ? entityFilter.trim() : undefined;
    api.getTimeline(src, ent, 150)
      .then(res => {
        setEvents(res);
        if (sourceFilter === 'ALL' && !ent) {
          try { sessionStorage.setItem('tracex_timeline_ALL', JSON.stringify(res)); } catch {}
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTimeline();
  }, [sourceFilter]);

  const handleEntitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTimeline();
  };

  const getSourceBadge = (source: string) => {
    switch (source.toUpperCase()) {
      case 'BLOCKCHAIN':
        return 'Cryptocurrency Ledger';
      case 'CTI':
        return 'Cyber Threat Intelligence';
      case 'DARKWEB':
        return 'Dark Web Underground Discussion';
      case 'PGP':
        return 'Pretty Good Privacy Digital Key';
      default:
        return source;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Hero Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Unified Cross-Source Chronological Timeline</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Event Timeline. The full story, arranged in order.
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          When piecing together complex digital actions, chronological order is everything. TRACE-X automatically aligns Ethereum transactions, forum leak notices, malware callbacks, and key signatures into one seamless narrative.
        </p>
      </div>

      {/* Filter controls (Wide Horizontal Bar) */}
      <div className="card-slide-stack mr-3 mb-4 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Filter Source:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'All Forensic Sources' },
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

        <form onSubmit={handleEntitySearch} className="flex items-center space-x-2">
          <input
            type="text"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            placeholder="Search keywords or addresses..."
            className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white w-64 shadow-inner transition font-medium"
          />
          <button
            type="submit"
            className="btn-liquid px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Timeline Stream with Wide Horizontal Event Cards */}
      {loading ? (
        <LoadingSpinner message="Aligning timestamps chronologically..." />
      ) : events.length === 0 ? (
        <div className="card-slide-stack mr-3 mb-4 p-12 text-center text-xs text-slate-500">
          No timeline events match the selected criteria.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-blue-200">
          {events.map((evt, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-6 mt-3.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center group-hover:scale-125 transition shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              </div>

              {/* Wide Horizontal Event Card */}
              <div className="card-slide-stack mr-3 mb-4 p-5 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {getSourceBadge(evt.source)}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">{evt.title}</h3>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <span className="text-xs font-mono text-slate-500 flex items-center space-x-1.5 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.timestamp?.replace('T', ' ')?.replace('+00:00', '')}</span>
                    </span>
                    {evt.evidence_id && (
                      <button
                        onClick={() => onSelectEvidence(evt.evidence_id!)}
                        className="btn-liquid-secondary px-3 py-1 rounded-xl text-xs font-bold"
                      >
                        View Clue Proof
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">{evt.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
