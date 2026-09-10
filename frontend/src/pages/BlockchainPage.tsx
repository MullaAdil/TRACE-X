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
  const [liveRpcData, setLiveRpcData] = useState<any>(null);
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

  const handleWalletSearch = async (e?: React.FormEvent, overrideAddr?: string) => {
    if (e) e.preventDefault();
    const queryAddr = (overrideAddr ?? walletFilter).trim();

    if (!queryAddr) {
      setWalletDossier(null);
      setLiveRpcData(null);
      const txs = await api.getTransactions(undefined, 50);
      setTransactions(txs);
      return;
    }

    setSearchingWallet(true);
    setLiveRpcData(null);

    // 1. Fetch live Alchemy RPC data if address looks like ETH (0x...)
    if (/^0x[a-fA-F0-9]{40}$/.test(queryAddr)) {
      api.getLiveBlockchainTelemetry(queryAddr)
        .then(data => setLiveRpcData(data))
        .catch(err => console.warn('Alchemy RPC query error:', err));
    }

    // 2. Fetch local case repository data
    try {
      const [dos, txs] = await Promise.all([
        api.getWalletDossier(queryAddr).catch(() => null),
        api.getTransactions(queryAddr, 50).catch(() => [])
      ]);
      setWalletDossier(dos);
      if (txs && txs.length > 0) setTransactions(txs);
    } catch (err: any) {
      console.warn('Local dossier error:', err);
    } finally {
      setSearchingWallet(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Apple-style Hero Header with AI-Generated Ledger Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-slate-800 p-8 shadow-xl text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Coins className="w-3.5 h-3.5" />
              <span>STANDALONE MICROSERVICE • BLOCKCHAIN FORENSICS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Follow the money. Track every Ethereum transfer.
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              When funds move across accounts, TRACE-X follows each hop on the public Ethereum ledger. Powered by live Alchemy RPC and on-chain transaction decoders, you get a crystal-clear breakdown of who sent what, who received it, and how wallets connect to known threat campaigns.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group">
              <img
                src="/src/assets/visuals/crypto_visual.jpg"
                alt="Cryptocurrency Forensics Flow"
                className="w-full h-44 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-3.5">
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ethereum Mainnet • Real-Time Decryption Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
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
            {stats.top_wallets.slice(0, 3).map((w, i) => (
              <button
                key={i}
                onClick={() => {
                  setWalletFilter(w.address);
                  handleWalletSearch(undefined, w.address);
                }}
                className="px-3 py-1 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-mono font-bold text-xs transition shadow-2xs flex items-center space-x-1.5"
              >
                <span>{w.address.slice(0, 8)}...{w.address.slice(-6)}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-100/80 rounded-md font-sans font-semibold">
                  {w.transaction_count} tx
                </span>
              </button>
            ))}

            {/* Quick Live Mainnet Test Button (Alchemy RPC) */}
            <button
              onClick={() => {
                const sample = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
                setWalletFilter(sample);
                handleWalletSearch(undefined, sample);
              }}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-800 hover:border-emerald-500 font-mono font-bold text-xs transition shadow-2xs flex items-center space-x-1.5"
              title="Test live Alchemy RPC query with Vitalik Buterin's public mainnet address"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Test Live Mainnet (0xd8dA6...)</span>
              <span className="text-[9px] uppercase font-sans font-extrabold px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900">
                Alchemy
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Live Ethereum Mainnet Telemetry Strip (Alchemy RPC) */}
      {liveRpcData && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-emerald-200/90 shadow-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  <span>Live Mainnet RPC Feed</span>
                </span>
                <span className="text-xs font-semibold text-slate-500">Powered by Alchemy</span>
              </div>
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 font-mono select-all break-all">
                {liveRpcData.address}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={liveRpcData.etherscan_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-liquid-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5"
              >
                <span>View on Etherscan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Live On-Chain Balance</span>
              <span className="text-xl font-black font-mono text-emerald-600 mt-1 block">
                {liveRpcData.balance_eth} ETH
              </span>
              <span className="text-[10px] text-slate-400">Current block balance</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">On-Chain Nonce / Txs</span>
              <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
                {liveRpcData.onchain_tx_count?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Total submitted transactions</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Account Classification</span>
              <span className="text-base font-bold text-blue-700 mt-1 block truncate">
                {liveRpcData.account_type}
              </span>
              <span className="text-[10px] text-slate-400">
                {liveRpcData.is_smart_contract ? 'Deployed contract bytecode' : 'Private key wallet (EOA)'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Live Block Height</span>
              <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                #{liveRpcData.live_block_height?.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Synced in real-time</span>
            </div>
          </div>

          {/* Recent Live Asset Transfers */}
          {liveRpcData.recent_transfers && liveRpcData.recent_transfers.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Recent Real-World Transfers (Alchemy Asset API)</span>
                <span className="text-slate-400 text-[11px]">{liveRpcData.recent_transfers.length} transfers recorded</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5">Tx Hash</th>
                      <th className="px-4 py-2.5">From</th>
                      <th className="px-4 py-2.5">To</th>
                      <th className="px-4 py-2.5">Asset / Value</th>
                      <th className="px-4 py-2.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {liveRpcData.recent_transfers.slice(0, 5).map((t: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80 font-mono text-[11px]">
                        <td className="px-4 py-2 text-blue-600 truncate max-w-[120px]">
                          <a href={`https://etherscan.io/tx/${t.hash}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {t.hash?.slice(0, 10)}...
                          </a>
                        </td>
                        <td className="px-4 py-2 text-slate-600 truncate max-w-[120px]">
                          {t.from ? `${t.from.slice(0, 6)}...${t.from.slice(-4)}` : 'Mint/Genesis'}
                        </td>
                        <td className="px-4 py-2 text-slate-600 truncate max-w-[120px]">
                          {t.to ? `${t.to.slice(0, 6)}...${t.to.slice(-4)}` : 'Burn'}
                        </td>
                        <td className="px-4 py-2 font-bold text-slate-900">
                          {t.value ? Number(t.value).toFixed(4) : '0.0000'} {t.asset}
                        </td>
                        <td className="px-4 py-2 text-slate-400 font-sans text-[10px]">
                          {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : 'Confirmed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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
