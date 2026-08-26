import React, { useState } from 'react';
import { Bot, Check, Sparkles, Copy, Terminal, ShieldAlert, Play } from 'lucide-react';

interface WebMCPStatusProps {
  registeredTools: string[];
  isWebMCPSupported: boolean;
  lastAgentAction: string | null;
}

const SAMPLE_PROMPTS = [
  {
    label: 'Detect Anomalies',
    prompt: 'Use analyze_anomalies to find high-risk Solana transactions in DuckDB and focus the 3D camera on the top risk node.',
  },
  {
    label: 'Filter Failed Txs',
    prompt: 'Filter the 3D transaction graph to show only failed transactions using filter_transactions(status="failed").',
  },
  {
    label: 'Helical Layout',
    prompt: 'Switch 3D graph visualization layout to helical timeline mode using set_layout_mode(mode="helical").',
  },
  {
    label: 'Query High Volume',
    prompt: 'Run SQL query using query_duckdb to find all transactions where amountSol > 10.',
  },
  {
    label: 'Reset Camera',
    prompt: 'Reset the 3D camera position and clear all active filters using reset_view().',
  },
];

export const WebMCPStatus: React.FC<WebMCPStatusProps> = ({
  registeredTools,
  isWebMCPSupported,
  lastAgentAction,
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'prompts'>('prompts');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleManualExecute = (toolName: string) => {
    const windowTools = (window as any).__webmcp_tools__;
    if (windowTools && windowTools[toolName]) {
      if (toolName === 'filter_transactions') windowTools[toolName]({ status: 'failed' });
      else if (toolName === 'set_layout_mode') windowTools[toolName]({ mode: 'helical' });
      else if (toolName === 'query_duckdb') windowTools[toolName]({ sql: 'SELECT * FROM transactions WHERE amountSol > 5' });
      else windowTools[toolName]();
    }
  };

  return (
    <div className="absolute top-4 right-4 font-mono z-20 pointer-events-auto hidden md:block">
      <div className="bg-[#070f1e]/90 backdrop-blur-xl border border-cyan-500/40 p-3.5 rounded-2xl shadow-[0_0_25px_rgba(0,242,254,0.15)] w-80 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-xs font-bold text-slate-100">WebMCP AI Co-Pilot</span>
          </div>
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
              isWebMCPSupported
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(20,241,149,0.3)]'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(153,69,255,0.3)]'
            }`}
          >
            {isWebMCPSupported ? 'Native WebMCP' : 'Polyfill Active'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px]">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`py-1 rounded-lg font-bold transition-all ${
              activeTab === 'prompts'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ChatGPT Prompts
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-1 rounded-lg font-bold transition-all ${
              activeTab === 'tools'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registered Tools ({registeredTools.length})
          </button>
        </div>

        {/* Tab 1: ChatGPT Quick Prompts */}
        {activeTab === 'prompts' && (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            <div className="text-[10px] text-cyan-300/80">Copy prompts to test in ChatGPT browser:</div>
            {SAMPLE_PROMPTS.map((item, idx) => (
              <div
                key={item.label}
                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all text-[10px]"
              >
                <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                  <span className="text-cyan-400">{item.label}</span>
                  <button
                    onClick={() => handleCopyPrompt(item.prompt, idx)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 text-[9px] text-slate-300 transition-all"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[9px] text-slate-400 font-mono leading-tight">{item.prompt}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Registered Tools */}
        {activeTab === 'tools' && (
          <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {registeredTools.map((tool) => (
              <div
                key={tool}
                className="flex items-center justify-between px-2 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px]"
              >
                <span className="text-emerald-400 font-bold font-mono">`{tool}`</span>
                <button
                  onClick={() => handleManualExecute(tool)}
                  title="Manual Dev Test Execution"
                  className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                >
                  <Play className="w-2.5 h-2.5" /> Run
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Last Action Indicator */}
        {lastAgentAction && (
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[10px] text-amber-300 flex items-center gap-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate font-bold">Agent Executed: {lastAgentAction}</span>
          </div>
        )}
      </div>
    </div>
  );
};

