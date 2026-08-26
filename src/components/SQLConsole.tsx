import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Table, Check } from 'lucide-react';

interface SQLConsoleProps {
  onExecuteSQL: (sql: string) => Promise<any[]>;
  onReset: () => void;
  isDuckDBReady: boolean;
  totalCount: number;
}

const PRESET_QUERIES = [
  { label: 'All Transactions', sql: 'SELECT * FROM transactions ORDER BY blockTime DESC LIMIT 50' },
  { label: 'Successful Only', sql: "SELECT * FROM transactions WHERE status = 'success' ORDER BY blockTime DESC LIMIT 50" },
  { label: 'Failed Only', sql: "SELECT * FROM transactions WHERE status = 'failed' ORDER BY blockTime DESC LIMIT 50" },
  { label: 'Group by Status', sql: 'SELECT status, COUNT(*) as count FROM transactions GROUP BY status' },
  { label: 'High Volume (>10 SOL)', sql: 'SELECT signature, amountSol, status, riskLevel FROM transactions WHERE amountSol > 10' },
];

export const SQLConsole: React.FC<SQLConsoleProps> = ({
  onExecuteSQL,
  onReset,
  isDuckDBReady,
  totalCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('SELECT * FROM transactions ORDER BY blockTime DESC LIMIT 50');
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = async (sqlToRun?: string) => {
    const execSql = sqlToRun || query;
    setIsExecuting(true);
    setSqlError(null);
    const start = performance.now();
    try {
      const results = await onExecuteSQL(execSql);
      setQueryResults(results);
      setExecutionTime(Math.round(performance.now() - start));
    } catch (err: any) {
      setSqlError(err?.message || 'SQL execution failed');
      setQueryResults(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetTerminal = () => {
    onReset();
    setQueryResults(null);
    setSqlError(null);
    setExecutionTime(null);
  };

  return (
    <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#070f1e]/90 hover:bg-[#070f1e] border border-cyan-500/40 text-slate-200 hover:text-cyan-300 rounded-xl backdrop-blur-md shadow-[0_0_15px_rgba(0,242,254,0.15)] text-xs font-mono transition-all"
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>DuckDB SQL Console</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-bold">
            {totalCount} txs
          </span>
        </button>
      ) : (
        <div className="w-[340px] md:w-[540px] bg-[#070f1e]/95 border border-cyan-500/40 backdrop-blur-2xl p-4 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.2)] space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>DuckDB WASM SQL Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetTerminal}
                className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
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
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {PRESET_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(pq.sql);
                  handleRun(pq.sql);
                }}
                className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 border border-slate-800 whitespace-nowrap transition-colors"
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
              className="w-full bg-slate-950/90 border border-cyan-500/30 focus:border-cyan-400 font-mono text-xs text-emerald-400 p-2.5 rounded-xl outline-none resize-none"
              placeholder="ENTER DUCKDB SQL QUERY..."
            />
            <button
              onClick={() => handleRun()}
              disabled={isExecuting || !isDuckDBReady}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-md transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Query
            </button>
          </div>

          {sqlError && (
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              Error: {sqlError}
            </div>
          )}

          {/* Query Results Table Visualization */}
          {queryResults && queryResults.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] text-cyan-300">
                <span className="flex items-center gap-1 font-bold">
                  <Table className="w-3 h-3" /> Results ({queryResults.length} rows)
                </span>
                {executionTime !== null && <span className="text-slate-400">{executionTime}ms</span>}
              </div>
              <div className="max-h-40 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-1 custom-scrollbar">
                <table className="w-full text-left text-[10px] font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-cyan-400">
                      {Object.keys(queryResults[0]).map((col) => (
                        <th key={col} className="p-1.5 whitespace-nowrap bg-slate-900/90 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.slice(0, 50).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-900/60 hover:bg-slate-900/40 text-slate-300">
                        {Object.keys(queryResults[0]).map((col) => (
                          <td key={col} className="p-1.5 whitespace-nowrap max-w-[200px] truncate">
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

