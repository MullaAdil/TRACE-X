import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Plus, Upload, Lock, ExternalLink, Shield } from 'lucide-react';
import { api } from '../services/api';
import { PgpKey } from '../types';

interface PgpPageProps {
  onSelectEvidence?: (evidenceId: string) => void;
}

export const PgpPage: React.FC<PgpPageProps> = () => {
  const [keys, setKeys] = useState<PgpKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [rawKeyInput, setRawKeyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  const loadKeys = () => {
    setLoading(true);
    api.getPgpKeys()
      .then(setKeys)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleVerify = async () => {
    if (!rawKeyInput.trim()) return;
    try {
      const res = await api.verifyPgpKey(rawKeyInput);
      setVerifyResult(res);
    } catch (err: any) {
      alert(`Invalid OpenPGP Key Armor: ${err.message}`);
      setVerifyResult(null);
    }
  };

  const handleImport = async () => {
    if (!rawKeyInput.trim()) return;
    setImporting(true);
    try {
      await api.importPgpKey(rawKeyInput);
      setShowImport(false);
      setRawKeyInput('');
      setVerifyResult(null);
      loadKeys();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Hero Header with Dedicated Microservice Banner & Slide-on-Slide Theme */}
      <div className="mr-3 mb-4">
        <div className="card-slide-stack relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-950 border border-blue-900/50 p-8 shadow-xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>STANDALONE MICROSERVICE • PGP CRYPTOGRAPHIC ID BENCHMARK</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Digital Signatures. Cryptographic proof of who is who.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Public OpenPGP keys serve as unforgeable digital identity seals. TRACE-X validates cryptographic fingerprints and user handles against official European key servers (CIRCL), guaranteeing tamper-proof verification.
              </p>
              <div>
                <button
                  onClick={() => setShowImport(true)}
                  className="btn-liquid px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import OpenPGP Key</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-blue-700/60 shadow-2xl group">
                <img
                  src="/src/assets/visuals/pgp_visual.jpg"
                  alt="PGP Cryptographic Signature Matrix"
                  className="w-full h-44 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-3.5">
                  <span className="text-[11px] font-mono text-blue-300 font-bold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>RSA 4096-bit • Key Escrow Anchor Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reference Benchmark Notice with Slide-on-Slide Theme */}
      <div className="mr-3 mb-4">
        <div className="card-slide-stack p-5 bg-blue-50/80 border border-blue-200 text-xs text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-blue-950 tracking-tight text-sm block">
                Verified Public Reference Key
              </span>
              <p className="text-slate-600 leading-relaxed max-w-3xl">
                The primary CIRCL key (<span className="font-mono font-bold text-blue-700">CA572205C0024E06BA70BE89EAADCFFC22BD4CD5</span>) is a published reference key used by Luxembourg’s incident response team for security bulletins. It serves as an authentic baseline and is not a threat actor.
              </p>
            </div>
          </div>
          <div className="shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 font-bold text-xs">
            Authentic Reference
          </div>
        </div>
      </div>

      {/* Wide Horizontal Key Cards with Slide-on-Slide Theme */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-blue-600 text-xs font-mono font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping mr-2.5"></span>
          <span>Checking OpenPGP keyrings...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((k, idx) => (
            <div key={idx} className="mr-3 mb-4">
              <div
                className="card-slide-stack p-6 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all shadow-2xs space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      ID: {k.key_id}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Cryptographically Validated
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {k.algorithm || "RSA 4096-bit"}
                  </span>
                </div>

                {/* Horizontal Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Fingerprint block */}
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cryptographic Fingerprint</span>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-blue-700 break-all select-all font-bold">
                      {k.fingerprint}
                    </div>
                  </div>

                  {/* Identity & Source */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Owner Identity</span>
                      <span className="font-bold text-slate-900 block mt-0.5">{k.uid}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block text-[10px] uppercase">Public Source</span>
                      <a
                        href={k.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline flex items-center space-x-1 mt-0.5"
                      >
                        <span className="truncate max-w-[200px]">{k.source}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal (Apple style) */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Import a Public Key</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paste the RFC 4880 ASCII Armor public key text. TRACE-X validates the cryptographic signature and fingerprint before saving it to your investigation keyring.
            </p>

            <textarea
              rows={7}
              value={rawKeyInput}
              onChange={(e) => setRawKeyInput(e.target.value)}
              placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----&#10;...&#10;-----END PGP PUBLIC KEY BLOCK-----"
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition"
            ></textarea>

            {verifyResult && (
              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs space-y-1">
                <span className="text-blue-700 font-bold block flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fingerprint Validated</span>
                </span>
                <div className="font-mono text-slate-900 font-bold text-[11px] break-all">{verifyResult.fingerprint}</div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleVerify}
                className="btn-liquid-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Validate Armor
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImport(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importing || !rawKeyInput.trim()}
                  onClick={handleImport}
                  className="btn-liquid px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {importing ? "Importing..." : "Add to Keyring"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
