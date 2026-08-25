import { useState, useEffect, useCallback } from 'react';
import { TransactionRecord, Node3D, FilterOptions } from '../types';
import { fetchWalletTransactions, isValidSolanaAddress } from '../services/solana';
import { getDuckDB, loadTransactionsToDuckDB, runSQLQuery } from '../services/db';

const DEFAULT_WALLETS = [
  { name: 'Raydium Pool', address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' },
  { name: 'Jupiter Aggregator', address: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4' },
  { name: 'Solana Foundation', address: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8' },
  { name: 'Binance Hot Wallet', address: '2ojv9BAiHUrvG9xjTxGatNuP5nNDxDFPxPz2w1Pug1Gq' },
];

export function useBlockchainData() {
  const [walletAddress, setWalletAddress] = useState<string>(DEFAULT_WALLETS[0].address);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
  const [nodes3D, setNodes3D] = useState<Node3D[]>([]);
  const [layoutMode, setLayoutMode] = useState<'cluster' | 'helical'>('cluster');
  
  const [isDuckDBReady, setIsDuckDBReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedSignature, setHighlightedSignature] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterOptions>({ status: 'all', riskLevel: 'ALL' });

  // Initialize DuckDB on page load
  useEffect(() => {
    let mounted = true;
    getDuckDB()
      .then(() => {
        if (mounted) setIsDuckDBReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize DuckDB:', err);
        if (mounted) setError(`DuckDB initialization error: ${err.message}`);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch transactions and load into DuckDB
  const loadWallet = useCallback(async (address: string) => {
    const cleanAddress = address.trim();
    if (!isValidSolanaAddress(cleanAddress)) {
      setError('Invalid Solana wallet public key address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHighlightedSignature(null);

    try {
      const txs = await fetchWalletTransactions(cleanAddress, 100);
      setTransactions(txs);
      setFilteredTransactions(txs);

      // Ingest into DuckDB WASM
      await loadTransactionsToDuckDB(txs);
      setWalletAddress(cleanAddress);
    } catch (err: any) {
      console.error('Error loading wallet transactions:', err);
      setError(err?.message || 'Failed to load wallet data from Solana RPC.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto load first default wallet when DuckDB is ready
  useEffect(() => {
    if (isDuckDBReady) {
      loadWallet(walletAddress);
    }
  }, [isDuckDBReady]);

  // Convert raw/filtered transactions into 3D node spatial positioning
  useEffect(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      setNodes3D([]);
      return;
    }

    const total = filteredTransactions.length;
    const sorted = [...filteredTransactions].sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0));

    const nodes: Node3D[] = sorted.map((tx, idx) => {
      let x = 0, y = 0, z = 0;

      if (layoutMode === 'helical') {
        // Helical / Spiral Timeline
        const angle = idx * 0.45;
        const radius = 6 + (idx / total) * 14;
        y = (idx - total / 2) * 0.4;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      } else {
        // Cluster / Orbital Network Graph
        const goldenAngle = 137.5 * (Math.PI / 180);
        const radius = Math.sqrt(idx + 1) * 2.2 + 4;
        const phi = Math.acos(1 - (2 * (idx + 0.5)) / total);
        const theta = goldenAngle * idx;

        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      }

      // Color and Geometry Shape assignments
      let color = '#9945FF'; // Default Solana Purple
      let shape: 'sphere' | 'octahedron' | 'tetrahedron' | 'icosahedron' = 'sphere';

      if (tx.signature === highlightedSignature) {
        color = '#FED700'; // Accent Yellow for selected
        shape = 'octahedron';
      } else if (tx.status === 'failed' || tx.riskLevel === 'HIGH') {
        color = '#FF3366'; // Crimson for high risk / failed
        shape = 'tetrahedron';
      } else if (tx.type === 'SWAP' || tx.type === 'CONTRACT') {
        color = '#14F195'; // Solana Green
        shape = 'icosahedron';
      } else if (tx.amountSol > 20) {
        color = '#FFB800'; // Gold
        shape = 'octahedron';
      }

      return {
        ...tx,
        x,
        y,
        z,
        position: [x, y, z],
        color,
        shape,
      };
    });

    setNodes3D(nodes);
  }, [filteredTransactions, highlightedSignature, layoutMode]);

  // Apply DuckDB SQL filter based on status or custom SQL
  const filterByStatus = useCallback(
    async (status: 'success' | 'failed' | 'all') => {
      setCurrentFilter(prev => ({ ...prev, status }));
      if (!isDuckDBReady) return;

      try {
        let sql = 'SELECT * FROM transactions ORDER BY blockTime DESC';
        if (status === 'success') {
          sql = "SELECT * FROM transactions WHERE status = 'success' ORDER BY blockTime DESC";
        } else if (status === 'failed') {
          sql = "SELECT * FROM transactions WHERE status = 'failed' ORDER BY blockTime DESC";
        }

        const results = await runSQLQuery<TransactionRecord>(sql);
        setFilteredTransactions(results);
      } catch (err: any) {
        console.error('SQL filter failed:', err);
      }
    },
    [isDuckDBReady]
  );

  // Execute custom raw SQL
  const executeSQL = useCallback(
    async (sql: string): Promise<TransactionRecord[]> => {
      if (!isDuckDBReady) throw new Error('DuckDB is not initialized yet.');
      const results = await runSQLQuery<TransactionRecord>(sql);
      setFilteredTransactions(results);
      return results;
    },
    [isDuckDBReady]
  );

  const analyzeAnomalies = useCallback(async () => {
    if (!isDuckDBReady) return null;

    try {
      const sql = "SELECT * FROM transactions WHERE status = 'failed' OR riskLevel = 'HIGH' ORDER BY amountSol DESC";
      const anomalies = await runSQLQuery<TransactionRecord>(sql);
      if (anomalies.length > 0) {
        setFilteredTransactions(anomalies);
        setHighlightedSignature(anomalies[0].signature);
        return anomalies[0].signature;
      }
    } catch (err) {
      console.error('Anomaly detection failed:', err);
    }
    return null;
  }, [isDuckDBReady]);

  const resetFilter = useCallback(() => {
    setFilteredTransactions(transactions);
    setHighlightedSignature(null);
    setCurrentFilter({ status: 'all', riskLevel: 'ALL' });
  }, [transactions]);

  return {
    walletAddress,
    transactions,
    filteredTransactions,
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
    setFilteredTransactions,
    defaultWallets: DEFAULT_WALLETS,
  };
}
