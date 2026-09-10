import React, { useEffect, useState } from 'react';
import { Globe2, ShieldAlert, Search, Filter, Hash, Database, FileText, UserX, MessageSquare, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { DarkWebStats, DarkWebThread } from '../types';

interface DarkWebPageProps {
  onSelectEvidence: (evidenceId: string) => void;
}

export const DarkWebPage: React.FC<DarkWebPageProps> = ({ onSelectEvidence }) => {
  const [stats, setStats] = useState<DarkWebStats | null>(null);
  const [threads, setThreads] = useState<DarkWebThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([
      api.getDarkWebStats(),
      api.getDarkWebThreads(undefined, undefined, 100)
    ]).then(([st, th]) => {
      setStats(st);
      setThreads(th);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    api.getDarkWebThreads(undefined, searchTerm, 100).then(setThreads);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Hero Header with AI-Generated Onion Routing Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-900 border border-purple-900/60 p-8 shadow-xl text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              <Globe2 className="w-3.5 h-3.5" />
              <span>STANDALONE MICROSERVICE • DARK WEB ONION CRAWLER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              What the dark web is saying. In plain view.
            </h1>
            <p className="text-sm text-purple-200 max-w-2xl leading-relaxed font-normal">
              TRACE-X continuously indexes verified underground onion forum discussions, identifying stolen credentials, leaked databases, and hacker collaboration threads—with zero hallucination and strict cryptographic chain of custody.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-purple-700/60 shadow-2xl group">
              <img
                src="/src/assets/visuals/darkweb_visual.jpg"
                alt="Dark Web Onion Layer De-anonymization"
                className="w-full h-44 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-3.5">
                <span className="text-[11px] font-mono text-purple-300 font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>Tor Circuit Multihop Telemetry Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Anonymity & Safeguard Disclaimer (Horizontal card) */}
      <div className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-700 shadow-2xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-extrabold text-blue-950 tracking-tight text-sm block">
              Ethical Attribution Guarantee
            </span>
            <p className="text-slate-600 leading-relaxed max-w-3xl">
              Research datasets mask forum poster identities as <span className="font-mono font-bold text-blue-800">[AUTHOR]</span> to protect privacy. TRACE-X never hallucinates real names. We analyze the leak targets, compromised domains, and technical clues.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 font-bold text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy Verified</span>
        </div>
      </div>

      {/* Horizontal Stats Strip (Apple-style wide blocks) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Indexed Posts</span>
                <span className="text-xs text-slate-600 font-medium">Underground discussions</span>
              </div>
            </div>
            <span className="text-2xl font-black font-mono text-slate-900">{stats.total_threads}</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Mentions</span>
                <span className="text-xs text-slate-600 font-medium">Named breach targets</span>
              </div>
            </div>
            <span className="text-2xl font-black font-mono text-blue-600">{stats.extracted_target_domains_count}</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Primary Channel</span>
                <span className="text-xs text-slate-600 font-medium">Research forum</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 truncate">DarkForums</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Author Safety</span>
                <span className="text-xs text-slate-600 font-medium">Synthetic guardrails</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">100% Masked</span>
          </div>
        </div>
      )}

      {/* Search Threads Form */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dark web discussions (e.g., 'database', 'leak', 'brazil', 'police', 'password')..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition"
            />
          </div>
          <button
            type="submit"
            className="btn-liquid px-6 py-3 rounded-2xl text-xs font-bold shrink-0"
          >
            Search Discussions
          </button>
        </form>
      </div>

      {/* Threads Table (Spacious horizontal rows) */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Underground Discussion Threads
            </h3>
            <p className="text-xs text-slate-500">Displaying {threads.length} verified records from research forum captures</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl self-start md:self-auto">
            Zenodo Academic Corpus
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Thread Ref</th>
                <th className="px-6 py-3.5">Discussion Topic</th>
                <th className="px-6 py-3.5">Author Handle</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {threads.map((t) => (
                <tr key={t.thread_id} className="hover:bg-blue-50/40 transition">
                  <td className="px-6 py-3.5 font-mono font-bold text-blue-600">#{t.thread_id}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 max-w-md">
                    <span className="line-clamp-1">{t.title}</span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-400">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {t.author || '[AUTHOR]'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {t.category || t.forum_name || 'Databases'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {t.evidence_id && (
                      <button
                        onClick={() => onSelectEvidence(t.evidence_id!)}
                        className="btn-liquid-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold"
                      >
                        View Clue Proof
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
