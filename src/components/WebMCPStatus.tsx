import React from 'react';
import { Bot, Check, Sparkles } from 'lucide-react';

interface WebMCPStatusProps {
  registeredTools: string[];
  isWebMCPSupported: boolean;
  lastAgentAction: string | null;
}

export const WebMCPStatus: React.FC<WebMCPStatusProps> = ({
  registeredTools,
  isWebMCPSupported,
  lastAgentAction,
}) => {
  return (
    <div className="absolute top-4 right-4 md:right-4 font-mono z-10 pointer-events-auto hidden md:block">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-3 rounded-2xl shadow-xl w-64 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Bot className="w-4 h-4 text-solana-purple" />
            <span>WebMCP AI Agent</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${
              isWebMCPSupported
                ? 'bg-solana-green/10 text-solana-green border-solana-green/30'
                : 'bg-solana-purple/10 text-solana-purple border-solana-purple/30'
            }`}
          >
            {isWebMCPSupported ? 'Native WebMCP' : 'Polyfill Active'}
          </span>
        </div>

        <div className="text-[10px] text-slate-400">Registered Browser Tools:</div>
        <div className="space-y-1">
          {registeredTools.map((tool) => (
            <div
              key={tool}
              className="flex items-center justify-between px-2 py-1 bg-slate-950/60 rounded border border-slate-800/60 text-[11px] text-slate-300"
            >
              <span className="text-solana-green font-semibold">`{tool}`</span>
              <Check className="w-3 h-3 text-solana-green" />
            </div>
          ))}
        </div>

        {lastAgentAction && (
          <div className="p-2 rounded bg-solana-purple/10 border border-solana-purple/30 text-[10px] text-solana-yellow flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-solana-yellow" />
            <span className="truncate">Agent: {lastAgentAction}</span>
          </div>
        )}
      </div>
    </div>
  );
};
