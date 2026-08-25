import React from 'react';
import { RefreshCw, ShieldAlert, Layers, Activity } from 'lucide-react';
import { Node3D } from '../types';

interface StatsPanelProps {
  nodes: Node3D[];
  totalTransactions: number;
  currentFilterStatus: string;
  layoutMode: 'cluster' | 'helical';
  onChangeLayout: (mode: 'cluster' | 'helical') => void;
  onFilterStatus: (status: 'all' | 'success' | 'failed') => void;
  onAnalyzeAnomalies: () => void;
  onResetView: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  nodes,
  totalTransactions,
  currentFilterStatus,
  layoutMode,
  onChangeLayout,
  onFilterStatus,
  onAnalyzeAnomalies,
  onResetView,
}) => {
  const successCount = nodes.filter((n) => n.status === 'success').length;
  const failedCount = nodes.filter((n) => n.status === 'failed').length;
  const highRiskCount = nodes.filter((n) => n.riskLevel === 'HIGH').length;

  return (
    <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl shadow-xl flex flex-wrap items-center gap-2 font-mono text-xs text-slate-200">
        
        {/* 3D Layout Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onChangeLayout('cluster')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              layoutMode === 'cluster'
                ? 'bg-solana-purple text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Orbital Cluster
          </button>
          <button
            onClick={() => onChangeLayout('helical')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              layoutMode === 'helical'
                ? 'bg-solana-purple text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Timeline Helix
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onFilterStatus('all')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              currentFilterStatus === 'all'
                ? 'bg-slate-800 text-slate-100 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalTransactions})
          </button>
          <button
            onClick={() => onFilterStatus('success')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              currentFilterStatus === 'success'
                ? 'bg-solana-green text-slate-950 shadow'
                : 'text-slate-400 hover:text-solana-green'
            }`}
          >
            Success ({successCount})
          </button>
          <button
            onClick={() => onFilterStatus('failed')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              currentFilterStatus === 'failed'
                ? 'bg-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Failed ({failedCount})
          </button>
        </div>

        {/* Anomaly Scan AI Button */}
        <button
          onClick={onAnalyzeAnomalies}
          className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1 transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Anomalies ({highRiskCount})
        </button>

        {/* Reset Camera & Filters */}
        <button
          onClick={onResetView}
          title="Reset Camera & Clear Selection"
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-solana-yellow border border-slate-700 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
