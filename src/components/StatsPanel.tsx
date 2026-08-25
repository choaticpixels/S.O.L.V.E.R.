import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Node3D } from '../types';

interface StatsPanelProps {
  nodes: Node3D[];
  totalTransactions: number;
  currentFilterStatus: string;
  onFilterStatus: (status: 'all' | 'success' | 'failed') => void;
  onResetView: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  nodes,
  totalTransactions,
  currentFilterStatus,
  onFilterStatus,
  onResetView,
}) => {
  const successCount = nodes.filter((n) => n.status === 'success').length;
  const failedCount = nodes.filter((n) => n.status === 'failed').length;

  return (
    <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 font-mono text-xs text-slate-200">
        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              currentFilterStatus === 'all'
                ? 'bg-solana-purple text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalTransactions})
          </button>
          <button
            onClick={() => onFilterStatus('success')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              currentFilterStatus === 'success'
                ? 'bg-solana-green text-slate-950 shadow'
                : 'text-slate-400 hover:text-solana-green'
            }`}
          >
            Success ({successCount})
          </button>
          <button
            onClick={() => onFilterStatus('failed')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              currentFilterStatus === 'failed'
                ? 'bg-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Failed ({failedCount})
          </button>
        </div>

        {/* Reset Camera & Filters */}
        <button
          onClick={onResetView}
          title="Reset Camera & Clear Selection"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-solana-yellow border border-slate-700 rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
