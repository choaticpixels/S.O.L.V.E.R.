import React from 'react';
import { ExternalLink, Clock, Layers, CheckCircle2, XCircle, FileText, Crosshair } from 'lucide-react';
import { Node3D } from '../types';

interface NodeInspectorProps {
  node: Node3D | null;
  onClose: () => void;
  onFocusNode: (signature: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ node, onClose, onFocusNode }) => {
  if (!node) return null;

  const formattedDate = node.blockTime
    ? new Date(node.blockTime * 1000).toLocaleString()
    : 'Unknown';

  const solscanUrl = `https://solscan.io/tx/${node.signature}`;

  return (
    <div className="absolute top-4 right-4 z-20 w-80 md:w-96 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-4 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              node.status === 'success' ? 'bg-solana-green shadow-lg shadow-solana-green/50' : 'bg-rose-500 shadow-lg shadow-rose-500/50'
            }`}
          />
          <h2 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase">
            Transaction Details
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800/50 font-mono"
        >
          ✕
        </button>
      </div>

      {/* Signature Box */}
      <div className="space-y-1">
        <div className="text-[10px] uppercase font-mono text-slate-400">Signature</div>
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-solana-yellow break-all select-all">
          {node.signature}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono">
            <Clock className="w-3 h-3 text-solana-purple" />
            <span>Block Time</span>
          </div>
          <div className="font-mono text-slate-200 text-[11px] truncate">{formattedDate}</div>
        </div>

        <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono">
            <Layers className="w-3 h-3 text-solana-green" />
            <span>Slot</span>
          </div>
          <div className="font-mono text-slate-200 text-[11px]">#{node.slot}</div>
        </div>

        <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1 col-span-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
            <span className="flex items-center gap-1.5">
              {node.status === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-solana-green" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
              )}
              Execution Status
            </span>
            <span
              className={`font-bold ${
                node.status === 'success' ? 'text-solana-green' : 'text-rose-400'
              }`}
            >
              {node.status.toUpperCase()}
            </span>
          </div>
          {node.err && (
            <div className="text-[10px] font-mono text-rose-400 bg-rose-500/10 p-1.5 rounded border border-rose-500/20 mt-1 overflow-x-auto">
              Err: {node.err}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onFocusNode(node.signature)}
          className="flex-1 py-2 bg-solana-purple/20 hover:bg-solana-purple/30 text-solana-purple border border-solana-purple/40 font-mono text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5" />
          Focus 3D View
        </button>
        <a
          href={solscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Solscan
        </a>
      </div>
    </div>
  );
};
