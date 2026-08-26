import React, { useState, useCallback } from 'react';
import { useBlockchainData } from './hooks/useBlockchainData';
import { useWebMCP } from './hooks/useWebMCP';
import { CanvasArea } from './components/CanvasArea';
import { CyberHUD } from './components/CyberHUD';
import { SQLConsole } from './components/SQLConsole';
import { NodeInspector } from './components/NodeInspector';
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
    layoutMode,
    setLayoutMode,
    loadWallet,
    filterByStatus,
    executeSQL,
    analyzeAnomalies,
    setHighlightedSignature,
    resetFilter,
    defaultWallets,
  } = useBlockchainData();

  const [selectedNode, setSelectedNode] = useState<Node3D | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [isSQLOpen, setIsSQLOpen] = useState<boolean>(false);
  const [isWebMCPOpen, setIsWebMCPOpen] = useState<boolean>(true);

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

  // Hook up WebMCP Agent registration
  const { isSupported: isWebMCPSupported, registeredTools, lastAction: lastAgentAction } = useWebMCP({
    filterByStatus,
    highlightNode: handleHighlightNode,
    resetView: handleResetView,
    analyzeAnomalies,
    queryDuckDB: executeSQL,
    setLayoutMode,
    loadWallet,
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
        walletAddress={walletAddress}
      />

      {/* Cyberpunk Glassmorphism HUD Overlay Layer */}
      <CyberHUD
        walletAddress={walletAddress}
        transactions={transactions}
        nodes={nodes3D}
        highlightedSignature={highlightedSignature}
        isLoading={isLoading}
        isDuckDBReady={isDuckDBReady}
        currentFilterStatus={currentFilter.status || 'all'}
        layoutMode={layoutMode}
        onSearch={loadWallet}
        onSelectNode={handleSelectNode}
        onChangeLayout={setLayoutMode}
        onFilterStatus={filterByStatus}
        onAnalyzeAnomalies={analyzeAnomalies}
        onResetView={handleResetView}
        onToggleSQL={() => setIsSQLOpen((prev) => !prev)}
        onToggleWebMCP={() => setIsWebMCPOpen((prev) => !prev)}
        defaultWallets={defaultWallets}
        isSQLOpen={isSQLOpen}
        isWebMCPOpen={isWebMCPOpen}
      />

      {/* WebMCP Status & Tools Overlay Panel */}
      {isWebMCPOpen && (
        <WebMCPStatus
          registeredTools={registeredTools}
          isWebMCPSupported={isWebMCPSupported}
          lastAgentAction={lastAgentAction}
        />
      )}

      {/* Node Inspector Sidebar Modal */}
      <NodeInspector
        node={selectedNode}
        onClose={() => {
          setSelectedNode(null);
          setHighlightedSignature(null);
        }}
        onFocusNode={handleHighlightNode}
      />

      {/* DuckDB Interactive SQL Console Drawer */}
      {isSQLOpen && (
        <SQLConsole
          onExecuteSQL={executeSQL}
          onReset={handleResetView}
          isDuckDBReady={isDuckDBReady}
          totalCount={transactions.length}
        />
      )}
    </div>
  );
}
