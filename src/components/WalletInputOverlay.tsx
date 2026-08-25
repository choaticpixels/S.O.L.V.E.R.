import React, { useState } from 'react';
import { Search, Loader2, Database, ShieldAlert, Cpu } from 'lucide-react';

interface WalletInputOverlayProps {
  currentWallet: string;
  isLoading: boolean;
  isDuckDBReady: boolean;
  onSearch: (address: string) => void;
  error: string | null;
}

const FEATURED_WALLETS = [
  { name: 'Solana Foundation', address: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8' },
  { name: 'Raydium Authority', address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' },
  { name: 'Pyth Oracle', address: 'FsJ3A3u2vn5cTVofAjW6y5wZksGLRA12G61UurD4nG28' },
];

export const WalletInputOverlay: React.FC<WalletInputOverlayProps> = ({
  currentWallet,
  isLoading,
  isDuckDBReady,
  onSearch,
  error,
}) => {
  const [inputVal, setInputVal] = useState(currentWallet);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 md:right-auto md:w-[480px] z-20 pointer-events-auto">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-3">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-solana-purple to-solana-green p-0.5 flex items-center justify-center shadow-lg shadow-solana-purple/20">
              <Cpu className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
                SOLANA 3D FORENSICS
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-solana-purple/20 text-solana-purple border border-solana-purple/30">
                  DuckDB + WebMCP
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Live Mainnet RPC Analysis</p>
            </div>
          </div>

          {/* DuckDB Status */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800">
            <Database className={`w-3.5 h-3.5 ${isDuckDBReady ? 'text-solana-green' : 'text-amber-400 animate-pulse'}`} />
            <span className={isDuckDBReady ? 'text-solana-green' : 'text-amber-400'}>
              {isDuckDBReady ? 'DuckDB WASM' : 'Loading WASM...'}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter Solana Wallet Address (Base58)..."
            className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-solana-purple focus:ring-1 focus:ring-solana-purple text-slate-100 placeholder-slate-500 font-mono text-xs pl-3.5 pr-20 py-2.5 rounded-xl outline-none transition-all"
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
            <span>Inspect</span>
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preset Wallet Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider whitespace-nowrap">Presamples:</span>
          {FEATURED_WALLETS.map((fw) => (
            <button
              key={fw.address}
              onClick={() => {
                setInputVal(fw.address);
                onSearch(fw.address);
              }}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-solana-green border border-slate-700/50 transition-colors whitespace-nowrap"
            >
              {fw.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
