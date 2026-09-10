import React, { useState } from 'react';
import { X, Send, Sparkles, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { AssistantChatResponse } from '../../types';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvidence?: (evidenceId: string) => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({ isOpen, onClose, onSelectEvidence }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{
    sender: 'user' | 'assistant';
    text: string;
    evidence?: string[];
    disclaimer?: string;
  }>>([
    {
      sender: 'assistant',
      text: "Greetings Investigator. I am the TRACE-X AI Copilot. I analyze multi-source threat telemetry, correlate fragmented indicators, and explain evidentiary support. How may I assist your investigation?",
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setQuery('');
    setLoading(true);

    try {
      const res: AssistantChatResponse = await api.askAssistant(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          evidence: res.supporting_evidence_ids,
          disclaimer: res.attribution_disclaimer
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error contacting correlation assistant: ${err.message || 'Unknown failure'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "What entities are connected to wallet 0x51c72848c68a965f66fa7a88855f9f7784502a7f?",
    "Why are these entities considered related to Packrat?",
    "What evidence is missing for real-world attribution?",
    "Which relationships have the strongest support?"
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 md:w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">AI Investigation Copilot</h2>
            <p className="text-[10px] text-slate-400 font-medium">Strictly grounded in verified project evidence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Supporting Evidence Citations */}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-blue-600 block mb-1.5 uppercase">
                    Supporting Verified Evidence:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.evidence.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => onSelectEvidence && onSelectEvidence(eid)}
                        className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-bold hover:bg-blue-100 transition"
                      >
                        {eid}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Guardrail Disclaimer */}
              {msg.disclaimer && (
                <div className="mt-2.5 text-[10px] text-slate-500 italic flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{msg.disclaimer}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-blue-600 font-bold font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>Synthesizing evidence-grounded response...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3.5 bg-white border-t border-slate-200 space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
          Quick Prompts
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-left transition truncate max-w-full font-medium"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-3.5 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask questions about evidence, correlations, or wallets..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-liquid p-2.5 rounded-xl disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
