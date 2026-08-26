import React from 'react';
import { ExternalLink, Clock, Layers, CheckCircle2, XCircle, ShieldAlert, Cpu, DollarSign } from 'lucide-react';
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

  // Forensic Risk Diagnosis Reasoning
  let riskReason = 'Standard System Transfer / On-Chain Instruction';
  if (node.status === 'failed') {
    riskReason = node.err ? `Execution Trapped: ${node.err}` : 'Instruction Execution Failure';
  } else if (node.amountSol > 50) {
    riskReason = 'High Volume Outflow (> 50 SOL Transfer)';
  } else if (node.type === 'SWAP') {
    riskReason = 'DEX Swap / Liquidity Pool Instruction';
  }

  return (
    <div className="absolute top-20 right-4 z-30 w-80 md:w-96 bg-[#070f1e]/95 backdrop-blur-2xl border border-cyan-500/40 p-4 rounded-2xl shadow-[0_0_35px_rgba(0,242,254,0.25)] space-y-3.5 pointer-events-auto font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              node.status === 'success'
                ? 'bg-emerald-400 shadow-[0_0_8px_#14F195]'
                : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
            }`}
          />
          <h2 className="text-xs font-bold tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Transaction Forensics
          </h2>
        </div>

        {/* Close Button with Guidance Tooltip Badge */}
        <div className="relative flex items-center">
          <div className="absolute -top-9 right-0 bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(0,242,254,0.5)] whitespace-nowrap animate-bounce flex items-center gap-1 z-40 border border-slate-900">
            <span>Close this window to explore more!</span>
            <span className="text-xs font-bold">➔</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-rose-400 text-xs px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/40 transition-all font-bold"
            title="Close Details Window"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Signature Box */}
      <div className="space-y-1">
        <div className="text-[9px] uppercase font-bold text-cyan-400 flex items-center justify-between">
          <span>Solana Transaction Signature</span>
          <span className="text-slate-400">{node.type}</span>
        </div>
        <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-amber-300 break-all select-all shadow-inner font-bold">
          {node.signature}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl space-y-0.5">
          <div className="flex items-center gap-1 text-slate-400 text-[9px] uppercase font-bold">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>Block Time</span>
          </div>
          <div className="text-slate-200 text-[10px] truncate">{formattedDate}</div>
        </div>

        <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl space-y-0.5">
          <div className="flex items-center gap-1 text-slate-400 text-[9px] uppercase font-bold">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Slot / Block</span>
          </div>
          <div className="text-slate-200 text-[10px]">#{node.slot}</div>
        </div>

        <div className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl space-y-0.5 col-span-2">
          <div className="flex items-center justify-between text-slate-400 text-[9px] uppercase font-bold">
            <span className="flex items-center gap-1">
              {node.status === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
              )}
              Execution Status & Transfer Value
            </span>
            <span className={node.status === 'success' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {node.status.toUpperCase()} ({node.amountSol} SOL)
            </span>
          </div>
          {node.err && (
            <div className="text-[9px] font-mono text-rose-300 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/30 mt-1 overflow-x-auto">
              Error: {node.err}
            </div>
          )}
        </div>
      </div>

      {/* Forensic Diagnosis Box */}
      <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1">
        <div className="flex items-center justify-between text-[9px] uppercase font-bold text-cyan-400">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Forensic Risk Diagnosis
          </span>
          <span className={node.riskLevel === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}>
            {node.riskLevel === 'HIGH' ? '98% (High Threat)' : '12% (Low Threat)'}
          </span>
        </div>
        <div className="text-[10px] text-slate-300 leading-tight">
          {riskReason}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          onClick={() => onFocusNode(node.signature)}
          className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
        >
          <Cpu className="w-3.5 h-3.5" />
          Focus 3D View
        </button>
        <a
          href={solscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          Solscan
        </a>
      </div>
    </div>
  );
};

