import React, { useEffect, useState } from 'react';
import { Coins, Search, ArrowUpRight, ArrowDownLeft, ArrowRight, UserX, ExternalLink, ShieldCheck, Activity, Database, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { BlockchainStats, BlockchainTx } from '../types';

interface BlockchainPageProps {
  onSelectEntity?: (entityId: number) => void;
}

export const BlockchainPage: React.FC<BlockchainPageProps> = () => {
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletFilter, setWalletFilter] = useState('');
  const [walletDossier, setWalletDossier] = useState<any>(null);
  const [searchingWallet, setSearchingWallet] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getBlockchainStats(),
      api.getTransactions(undefined, 50)
    ]).then(([st, txs]) => {
      setStats(st);
      setTransactions(txs);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleWalletSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletFilter.trim()) {
      setWalletDossier(null);
      const txs = await api.getTransactions(undefined, 50);
      setTransactions(txs);
      return;
    }
    setSearchingWallet(true);
    try {
      const [dos, txs] = await Promise.all([
        api.getWalletDossier(walletFilter.trim()),
        api.getTransactions(walletFilter.trim(), 50)
      ]);
      setWalletDossier(dos);
      setTransactions(txs);
    } catch (err: any) {
      alert(`Wallet not found or no transactions recorded: ${err.message}`);
    } finally {
      setSearchingWallet(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Hero Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Coins className="w-3.5 h-3.5" />
          <span>Crypto Ledger Intelligence</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Follow the money. Track every Ethereum transfer.
        </h1>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          When funds move across accounts, TRACE-X follows each hop on the public Ethereum ledger. You get a crystal-clear breakdown of who sent what, who received it, and how wallets connect to known threat campaigns.
        </p>
      </div>

      {/* Horizontal Stats Strip (Apple-style wide blocks) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Transfers</span>
                <span className="text-xs text-slate-600 font-medium">Recorded on-chain</span>
              </div>
            </div>
            <span className="text-2xl font-black font-mono text-slate-900">{stats.total_transactions}</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Unique Wallets</span>
                <span className="text-xs text-slate-600 font-medium">Individual accounts</span>
              </div>
            </div>
            <span className="text-2xl font-black font-mono text-blue-600">{stats.unique_wallets}</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Volume</span>
                <span className="text-xs text-slate-600 font-medium">Transferred in ETH</span>
              </div>
            </div>
            <span className="text-2xl font-black font-mono text-blue-600">{stats.total_volume_eth} ETH</span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between space-x-4 shadow-2xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Earliest Record</span>
                <span className="text-xs text-slate-600 font-medium">First observed block</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 max-w-[110px] truncate text-right">
              {stats.first_block_time?.split('T')[0] || '2024-01-15'}
            </span>
          </div>
        </div>
      )}

      {/* Wallet Search Bar (Wide Horizontal Layout) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Inspect Any Ethereum Address</h2>
            <p className="text-xs text-slate-500">Paste any public wallet address to view its total transaction history, counterparties, and connected cases.</p>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl shrink-0">
            Public Ethereum Ledger
          </span>
        </div>

        <form onSubmit={handleWalletSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
              placeholder="Paste wallet address (e.g., 0x51c72848c68a965f66fa7a88855f9f7784502a7f)..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 placeholder-slate-400 font-mono font-medium focus:outline-none focus:border-blue-500 focus:bg-white shadow-inner transition"
            />
          </div>
          <button
            type="submit"
            disabled={searchingWallet}
            className="btn-liquid px-6 py-3 rounded-2xl text-xs font-bold shrink-0 disabled:opacity-50"
          >
            {searchingWallet ? "Searching..." : "Inspect Address"}
          </button>
        </form>

        {stats && stats.top_wallets.length > 0 && !walletDossier && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Frequently Tracked Accounts:</span>
            {stats.top_wallets.slice(0, 4).map((w, i) => (
              <button
                key={i}
                onClick={() => {
                  setWalletFilter(w.address);
                  api.getWalletDossier(w.address).then(setWalletDossier);
                  api.getTransactions(w.address, 50).then(setTransactions);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-mono font-bold text-xs transition shadow-2xs flex items-center space-x-1.5"
              >
                <span>{w.address.slice(0, 8)}...{w.address.slice(-6)}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-100/80 rounded-md font-sans font-semibold">
                  {w.transaction_count} tx
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Dossier (Wide Horizontal Layout) */}
      {walletDossier && (
        <div className="p-6 rounded-3xl bg-white border border-blue-200 space-y-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Wallet File
                </span>
                <span className="text-xs font-semibold text-slate-500">Active Dossier</span>
              </div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 font-mono select-all break-all">
                {walletDossier.address}
              </h2>
            </div>
            <button
              onClick={() => {
                setWalletDossier(null);
                setWalletFilter('');
                api.getTransactions(undefined, 50).then(setTransactions);
              }}
              className="btn-liquid-secondary px-4 py-2 rounded-xl text-xs font-bold self-start md:self-auto"
            >
              Reset to Full Ledger
            </button>
          </div>

          {/* Horizontal Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Transactions</span>
              <span className="text-xl font-black font-mono text-slate-900 mt-1 block">{walletDossier.transaction_count}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Counterparties</span>
              <span className="text-xl font-black font-mono text-blue-600 mt-1 block">{walletDossier.unique_counterparties_count}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Sent Funds</span>
              <span className="text-xl font-black font-mono text-slate-900 mt-1 block">{walletDossier.total_sent_eth} ETH</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Received Funds</span>
              <span className="text-xl font-black font-mono text-blue-600 mt-1 block">{walletDossier.total_received_eth} ETH</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start space-x-3">
            <UserX className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-blue-900 block">Responsible Attribution Guarantee:</span>
              <span className="text-slate-600 leading-relaxed">{walletDossier.attribution_warning}</span>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table / Ledger View */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              On-Chain Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500">Showing {transactions.length} verified transactions from the Ethereum mainnet</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl self-start md:self-auto">
            100% Verifiable on Etherscan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Block</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">From (Sender)</th>
                <th className="px-6 py-3.5">To (Recipient)</th>
                <th className="px-6 py-3.5 text-right">Amount (ETH)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition">
                  <td className="px-6 py-3.5 text-slate-600 font-semibold">#{tx.block_number}</td>
                  <td className="px-6 py-3.5 text-slate-500 font-sans text-xs">
                    {tx.timestamp.replace('T', ' ').replace('+00:00', '')}
                  </td>
                  <td className="px-6 py-3.5 text-blue-600 font-bold hover:underline">
                    <a
                      href={`https://etherscan.io/tx/${tx.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1"
                    >
                      <span>{tx.transaction_hash.slice(0, 10)}...{tx.transaction_hash.slice(-6)}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700 font-semibold">
                    <button
                      onClick={() => {
                        setWalletFilter(tx.from_address);
                        api.getWalletDossier(tx.from_address).then(setWalletDossier);
                      }}
                      className="hover:text-blue-600 transition"
                      title="Inspect this sender wallet"
                    >
                      {tx.from_address.slice(0, 8)}...{tx.from_address.slice(-6)}
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700 font-semibold">
                    <button
                      onClick={() => {
                        setWalletFilter(tx.to_address);
                        api.getWalletDossier(tx.to_address).then(setWalletDossier);
                      }}
                      className="hover:text-blue-600 transition"
                      title="Inspect this recipient wallet"
                    >
                      {tx.to_address.slice(0, 8)}...{tx.to_address.slice(-6)}
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-right font-bold text-blue-600">
                    {tx.value_eth > 0 ? `${tx.value_eth.toFixed(4)} ETH` : '0 ETH'}
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
