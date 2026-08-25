import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Table } from 'lucide-react';

interface SQLConsoleProps {
  onExecuteSQL: (sql: string) => Promise<any>;
  onReset: () => void;
  isDuckDBReady: boolean;
  totalCount: number;
}

const PRESET_QUERIES = [
  { label: 'All Transactions', sql: 'SELECT * FROM transactions ORDER BY blockTime DESC' },
  { label: 'Successful Only', sql: "SELECT * FROM transactions WHERE status = 'success' ORDER BY blockTime DESC" },
  { label: 'Failed Only', sql: "SELECT * FROM transactions WHERE status = 'failed' ORDER BY blockTime DESC" },
  { label: 'Group by Status', sql: 'SELECT status, COUNT(*) as count FROM transactions GROUP BY status' },
];

export const SQLConsole: React.FC<SQLConsoleProps> = ({
  onExecuteSQL,
  onReset,
  isDuckDBReady,
  totalCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('SELECT * FROM transactions ORDER BY blockTime DESC LIMIT 50');
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = async (sqlToRun?: string) => {
    const execSql = sqlToRun || query;
    setIsExecuting(true);
    setSqlError(null);
    try {
      await onExecuteSQL(execSql);
    } catch (err: any) {
      setSqlError(err?.message || 'SQL execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-solana-green rounded-xl backdrop-blur-md shadow-xl text-xs font-mono transition-all"
        >
          <Terminal className="w-4 h-4 text-solana-green" />
          <span>DuckDB SQL Console</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
            {totalCount} txs
          </span>
        </button>
      ) : (
        <div className="w-[340px] md:w-[480px] bg-slate-900/95 border border-slate-800 backdrop-blur-2xl p-4 rounded-2xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
              <Terminal className="w-4 h-4 text-solana-green" />
              <span>DuckDB WASM SQL Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onReset}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-1.5 font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {PRESET_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(pq.sql);
                  handleRun(pq.sql);
                }}
                className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-solana-yellow border border-slate-700/60 whitespace-nowrap transition-colors"
              >
                {pq.label}
              </button>
            ))}
          </div>

          {/* Query Textarea */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-solana-green font-mono text-xs text-solana-green p-2.5 rounded-xl outline-none resize-none"
              placeholder="ENTER DUCKDB SQL QUERY..."
            />
            <button
              onClick={() => handleRun()}
              disabled={isExecuting || !isDuckDBReady}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-solana-green hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-md transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Query
            </button>
          </div>

          {sqlError && (
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {sqlError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
