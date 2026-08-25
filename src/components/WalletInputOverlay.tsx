import React, { useState } from 'react';
import { Search, Loader2, Database, ShieldAlert, Cpu } from 'lucide-react';

interface WalletInputOverlayProps {
  currentWallet: string;
  isLoading: boolean;
  isDuckDBReady: boolean;
  onSearch: (address: string) => void;
  error: string | null;
  defaultWallets: { name: string; address: string }[];
}

export const WalletInputOverlay: React.FC<WalletInputOverlayProps> = ({
  currentWallet,
  isLoading,
  isDuckDBReady,
  onSearch,
  error,
  defaultWallets,
}) => {
  const [inputVal, setInputVal] = useState(currentWallet);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 md:right-auto md:w-[500px] z-20 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-3">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solana-purple to-solana-green p-0.5 flex items-center justify-center shadow-lg shadow-solana-purple/30">
              <Cpu className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
                S.O.L.V.E.R. 3D
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-solana-purple/20 text-solana-purple border border-solana-purple/40 font-mono">
                  W3C WebMCP
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Solana On-Chain Forensics & AI Agent Engine</p>
            </div>
          </div>

          {/* DuckDB Status */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800">
            <Database className={`w-3.5 h-3.5 ${isDuckDBReady ? 'text-solana-green' : 'text-amber-400 animate-pulse'}`} />
            <span className={isDuckDBReady ? 'text-solana-green' : 'text-amber-400'}>
              {isDuckDBReady ? 'DuckDB WASM' : 'Init WASM...'}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter Solana Wallet / Program Address..."
            className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-solana-purple focus:ring-1 focus:ring-solana-purple text-slate-100 placeholder-slate-500 font-mono text-xs pl-3.5 pr-20 py-2.5 rounded-xl outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !isDuckDBReady}
            className="absolute right-1.5 px-3 py-1.5 bg-gradient-to-r from-solana-purple to-purple-600 hover:brightness-110 disabled:opacity-50 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Analyze</span>
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
        )}

        {/* Preset Wallet Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider shrink-0">Presamples:</span>
          {defaultWallets.map((fw) => (
            <button
              key={fw.address}
              onClick={() => {
                setInputVal(fw.address);
                onSearch(fw.address);
              }}
              className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all whitespace-nowrap ${
                currentWallet === fw.address
                  ? 'bg-solana-purple/20 border-solana-purple text-solana-purple font-bold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {fw.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
