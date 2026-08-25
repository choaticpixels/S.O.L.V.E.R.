import React, { useState, useCallback } from 'react';
import { useBlockchainData } from './hooks/useBlockchainData';
import { useWebMCP } from './hooks/useWebMCP';
import { CanvasArea } from './components/CanvasArea';
import { WalletInputOverlay } from './components/WalletInputOverlay';
import { SQLConsole } from './components/SQLConsole';
import { NodeInspector } from './components/NodeInspector';
import { StatsPanel } from './components/StatsPanel';
import { WebMCPStatus } from './components/WebMCPStatus';
import { Node3D } from './types';

export default function App() {
  const {
    walletAddress,
    transactions,
    nodes3D,
    isDuckDBReady,
    isLoading,
    error,
    highlightedSignature,
    currentFilter,
    loadWallet,
    filterByStatus,
    executeSQL,
    setHighlightedSignature,
    resetFilter,
  } = useBlockchainData();

  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // WebMCP Action Handlers
  const handleHighlightNode = useCallback(
    (signature: string) => {
      setHighlightedSignature(signature);
      const targetNode = nodes3D.find((n) => n.signature === signature);
      if (targetNode) {
        setSelectedNode(targetNode);
      }
    },
    [nodes3D, setHighlightedSignature]
  );

  const handleResetView = useCallback(() => {
    resetFilter();
    setSelectedNode(null);
    setResetTrigger((prev) => prev + 1);
  }, [resetFilter]);

  // Hook up WebMCP Agent registration inside useEffect
  const { isSupported: isWebMCPSupported, registeredTools, lastAction: lastAgentAction } = useWebMCP({
    filterByStatus,
    highlightNode: handleHighlightNode,
    resetView: handleResetView,
  });

  const handleSelectNode = (node: Node3D) => {
    setSelectedNode(node);
    setHighlightedSignature(node.signature);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 3D WebGL Canvas Layer */}
      <CanvasArea
        nodes={nodes3D}
        highlightedSignature={highlightedSignature}
        onSelectNode={handleSelectNode}
        resetTrigger={resetTrigger}
      />

      {/* Top Left: Wallet Search Overlay */}
      <WalletInputOverlay
        currentWallet={walletAddress}
        isLoading={isLoading}
        isDuckDBReady={isDuckDBReady}
        onSearch={loadWallet}
        error={error}
      />

      {/* Top Right: WebMCP Status & Tools Indicator */}
      <WebMCPStatus
        registeredTools={registeredTools}
        isWebMCPSupported={isWebMCPSupported}
        lastAgentAction={lastAgentAction}
      />

      {/* Node Inspector Modal / Sidebar */}
      <NodeInspector
        node={selectedNode}
        onClose={() => {
          setSelectedNode(null);
          setHighlightedSignature(null);
        }}
        onFocusNode={handleHighlightNode}
      />

      {/* Bottom Left: DuckDB SQL Terminal */}
      <SQLConsole
        onExecuteSQL={executeSQL}
        onReset={handleResetView}
        isDuckDBReady={isDuckDBReady}
        totalCount={transactions.length}
      />

      {/* Bottom Right: Status Filters & Camera Reset */}
      <StatsPanel
        nodes={nodes3D}
        totalTransactions={transactions.length}
        currentFilterStatus={currentFilter.status || 'all'}
        onFilterStatus={filterByStatus}
        onResetView={handleResetView}
      />
    </div>
  );
}
