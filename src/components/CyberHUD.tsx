import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  ShieldAlert,
  Search,
  RefreshCw,
  Cpu,
  TrendingUp,
  Sliders,
  Maximize2,
  Terminal,
  Layers,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { Node3D, TransactionRecord } from '../types';

interface CyberHUDProps {
  walletAddress: string;
  transactions: TransactionRecord[];
  nodes: Node3D[];
  highlightedSignature: string | null;
  isLoading: boolean;
  isDuckDBReady: boolean;
  currentFilterStatus: string;
  layoutMode: 'cluster' | 'helical';
  onSearch: (address: string) => void;
  onSelectNode: (node: Node3D) => void;
  onChangeLayout: (mode: 'cluster' | 'helical') => void;
  onFilterStatus: (status: 'all' | 'success' | 'failed') => void;
  onAnalyzeAnomalies: () => void;
  onResetView: () => void;
  onToggleSQL: () => void;
  onToggleWebMCP: () => void;
  defaultWallets: { name: string; address: string }[];
  isSQLOpen: boolean;
  isWebMCPOpen: boolean;
}

export const CyberHUD: React.FC<CyberHUDProps> = ({
  walletAddress,
  transactions,
  nodes,
  highlightedSignature,
  isLoading,
  isDuckDBReady,
  currentFilterStatus,
  layoutMode,
  onSearch,
  onSelectNode,
  onChangeLayout,
  onFilterStatus,
  onAnalyzeAnomalies,
  onResetView,
  onToggleSQL,
  onToggleWebMCP,
  defaultWallets,
  isSQLOpen,
  isWebMCPOpen,
}) => {
  const [inputVal, setInputVal] = useState(walletAddress);
  const [solPrice, setSolPrice] = useState<number>(148.5);

  useEffect(() => {
    setInputVal(walletAddress);
  }, [walletAddress]);

  // Fetch live SOL price if possible
  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin&vs_currencies=usd')
      .then((res) => res.json())
      .then((data) => {
        if (data?.solana?.usd) setSolPrice(data.solana.usd);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) onSearch(inputVal.trim());
  };

  const totalTxCount = transactions.length;
  const failedCount = transactions.filter((t) => t.status === 'failed').length;
  const highRiskCount = transactions.filter((t) => t.riskLevel === 'HIGH').length;
  const totalVolume = transactions.reduce((acc, t) => acc + (t.amountSol || 0), 0);
  const currentSlot = transactions[0]?.slot || 812945;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 font-mono select-none overflow-hidden">
      {/* ================= TOP HEADER & SEARCH BAR ================= */}
      <header className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto bg-[#070f1e]/90 backdrop-blur-xl border border-cyan-500/40 p-3 rounded-2xl shadow-[0_0_20px_rgba(0,242,254,0.15)]">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-cyan-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider text-white flex items-center gap-2">
              S.O.L.V.E.R. <span className="text-solana-yellow text-xs font-normal">3D Forensics</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-cyan-300/80">
              <span className="flex items-center gap-1"><Radio className="w-3 h-3 text-emerald-400 animate-ping" /> Live Mainnet</span>
              <span>•</span>
              <span className="text-slate-400">W3C WebMCP Standard</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl flex items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search Solana Wallet / Program Address..."
              className="w-full bg-slate-950/90 border border-cyan-500/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-xs font-mono pl-3.5 pr-24 py-2 rounded-xl outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !isDuckDBReady}
              className="absolute right-1 top-1 bottom-1 px-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-md"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Inspect</span>
            </button>
          </div>
        </form>

        {/* Presamples */}
        <div className="hidden xl:flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mr-1">Targets:</span>
          {defaultWallets.map((w) => (
            <button
              key={w.address}
              onClick={() => {
                setInputVal(w.address);
                onSearch(w.address);
              }}
              className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                walletAddress === w.address
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      </header>

      {/* ================= MIDDLE SECTION: LEFT & RIGHT FLOATING HUD PANELS ================= */}
      <div className="flex-1 flex justify-between items-stretch py-3 gap-4 pointer-events-none">
        
        {/* LEFT COLUMN PANELS */}
        <div className="w-72 flex flex-col justify-between space-y-3 pointer-events-auto">
          
          {/* Top Left: NETWORK ANALYSIS */}
          <div className="bg-[#06101e]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-lg relative">
            <div className="flex items-center justify-between text-cyan-400 border-b border-cyan-500/20 pb-1.5 mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Network Analysis
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500/10 rounded text-cyan-300">LIVE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Node Count</div>
                <div className="text-base font-bold text-white">{nodes.length}</div>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Total Tx</div>
                <div className="text-base font-bold text-emerald-400">{totalTxCount}</div>
              </div>
            </div>

            {/* High-Risk Activity Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                <span>High-Risk Activity</span>
                <span className="text-rose-400 font-bold">{highRiskCount} Flagged</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, (highRiskCount / (totalTxCount || 1)) * 100 * 3))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Middle Left: SUB-GRAPH PREVIEW */}
          <div className="bg-[#06101e]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-lg flex-1 flex flex-col justify-between max-h-[160px]">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between border-b border-cyan-500/20 pb-1">
              <span>Sub-Graph Cluster</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="relative flex-1 my-1 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
              {/* Decorative mini grid graph */}
              <div className="absolute inset-0 bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#D037FF] animate-pulse" />
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400" />
                <div className="w-4 h-4 rounded-full bg-solana-yellow shadow-[0_0_12px_#FED700]" />
                <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#14F195] animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Layout: {layoutMode.toUpperCase()}</span>
              <button
                onClick={() => onChangeLayout(layoutMode === 'cluster' ? 'helical' : 'cluster')}
                className="text-cyan-300 hover:text-white underline"
              >
                Switch
              </button>
            </div>
          </div>

          {/* Bottom Left: SUSPECT ACTIVITY LOG */}
          <div className="bg-[#06101e]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-lg flex-1 flex flex-col min-h-[200px] max-h-[280px]">
            <div className="border-b border-cyan-500/20 pb-1.5 mb-2">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Suspect Activity Log</div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>Live Tx Feed</span>
                <span>Block: #{currentSlot}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {transactions.slice(0, 10).map((tx) => {
                const isSelected = tx.signature === highlightedSignature;
                return (
                  <button
                    key={tx.signature}
                    onClick={() => {
                      const target = nodes.find((n) => n.signature === tx.signature);
                      if (target) onSelectNode(target);
                    }}
                    className={`w-full text-left p-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-solana-yellow/20 border-solana-yellow text-solana-yellow font-bold'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          tx.status === 'failed' || tx.riskLevel === 'HIGH'
                            ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                            : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                        }`}
                      />
                      <span className="truncate">{tx.signature.slice(0, 10)}...</span>
                    </div>
                    <span className="text-slate-400 shrink-0 text-[9px]">{tx.slot}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN PANELS */}
        <div className="w-80 flex flex-col justify-between space-y-3 pointer-events-auto">

          {/* Top Right: BLOCKCHAIN INSIGHTS */}
          <div className="bg-[#06101e]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-lg">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider border-b border-cyan-500/20 pb-1.5 mb-2.5 flex items-center justify-between">
              <span>Blockchain Insights</span>
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-solana-purple flex items-center justify-center font-bold text-[9px] text-black">SOL</div>
                  <span className="text-xs font-bold text-slate-200">SOL/USD</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">${solPrice.toFixed(1)}</span>
                  <span className="text-[9px] text-emerald-400 block flex items-center gap-0.5 justify-end">
                    <TrendingUp className="w-2.5 h-2.5" /> +4.2%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center font-bold text-[9px] text-black">BTC</div>
                  <span className="text-xs font-bold text-slate-200">BTC/USD</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">$64,250</span>
                  <span className="text-[9px] text-emerald-400 block flex items-center gap-0.5 justify-end">
                    <TrendingUp className="w-2.5 h-2.5" /> +1.8%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Right: WALLET PROFILING */}
          <div className="bg-[#06101e]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-lg flex-1 flex flex-col justify-between">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider border-b border-cyan-500/20 pb-1.5 mb-2">
              Target Wallet Profiling
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Target Address</span>
                <span className="font-bold text-solana-yellow truncate block text-[11px]">
                  {walletAddress}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Volume Analyzed</span>
                  <span className="font-bold text-emerald-400 text-xs">{totalVolume.toFixed(1)} SOL</span>
                </div>

                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Threat Level</span>
                  <span className={`font-bold text-xs ${highRiskCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {highRiskCount > 0 ? '98% (High)' : '12% (Low)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Risk Progress Radial Gauge */}
            <div className="mt-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke={highRiskCount > 0 ? '#f43f5e' : '#34d399'}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="113"
                    strokeDashoffset={highRiskCount > 0 ? '10' : '90'}
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-white">
                  {highRiskCount > 0 ? '98%' : '12%'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Status Breakdown</span>
                <div className="flex items-center gap-2 text-[11px] font-bold mt-0.5">
                  <span className="text-emerald-400">{transactions.length - failedCount} Clean</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-rose-400">{failedCount} Failed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: INVESTIGATION PANEL */}
          <div className="bg-[#06101e]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-lg">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider border-b border-cyan-500/20 pb-2 mb-2.5">
              Investigation Panel
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onToggleSQL}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isSQLOpen
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>SQL Terminal</span>
              </button>

              <button
                onClick={onToggleWebMCP}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  isWebMCPOpen
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(153,69,255,0.3)]'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-solana-purple" />
                <span>WebMCP Agent</span>
              </button>

              <button
                onClick={onAnalyzeAnomalies}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Anomalies</span>
              </button>

              <button
                onClick={onResetView}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-solana-yellow" />
                <span>Reset View</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
