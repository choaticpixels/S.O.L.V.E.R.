import { useState, useEffect, useCallback } from 'react';
import { TransactionRecord, Node3D, FilterOptions } from '../types';
import { fetchWalletTransactions, isValidSolanaAddress } from '../services/solana';
import { getDuckDB, loadTransactionsToDuckDB, runSQLQuery } from '../services/db';

const DEFAULT_WALLET = '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8'; // Solana Foundation

export function useBlockchainData() {
  const [walletAddress, setWalletAddress] = useState<string>(DEFAULT_WALLET);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
  const [nodes3D, setNodes3D] = useState<Node3D[]>([]);
  
  const [isDuckDBReady, setIsDuckDBReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedSignature, setHighlightedSignature] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterOptions>({ status: 'all' });

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

  // Fetch transactions and load into DuckDB when wallet address changes
  const loadWallet = useCallback(async (address: string) => {
    if (!isValidSolanaAddress(address)) {
      setError('Invalid Solana wallet public key.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHighlightedSignature(null);

    try {
      const txs = await fetchWalletTransactions(address, 100);
      setTransactions(txs);
      setFilteredTransactions(txs);

      // Ingest into DuckDB WASM
      await loadTransactionsToDuckDB(txs);
      setWalletAddress(address);
    } catch (err: any) {
      console.error('Error loading wallet transactions:', err);
      setError(err?.message || 'Failed to load wallet data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto load default wallet once DuckDB is ready
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
    
    // Create 3D spatial positioning (Helical / Force layout)
    const nodes: Node3D[] = sorted.map((tx, idx) => {
      const angle = idx * 0.45;
      const radius = 6 + (idx / total) * 14;
      const y = (idx - total / 2) * 0.4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Color logic adhering strictly to design system:
      // Primary: Solana Purple #9945FF, Green #14F195 for latest, Yellow #FED700 for highlight
      let color = '#9945FF';
      if (tx.signature === highlightedSignature) {
        color = '#FED700'; // Accent Yellow
      } else if (idx < 5) {
        color = '#14F195'; // Solana Green for recent
      } else if (tx.status === 'failed') {
        color = '#FF3366'; // Red for error
      }

      return {
        ...tx,
        x,
        y,
        z,
        position: [x, y, z],
        color,
      };
    });

    setNodes3D(nodes);
  }, [filteredTransactions, highlightedSignature]);

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

  const resetFilter = useCallback(() => {
    setFilteredTransactions(transactions);
    setHighlightedSignature(null);
    setCurrentFilter({ status: 'all' });
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
    loadWallet,
    filterByStatus,
    executeSQL,
    setHighlightedSignature,
    resetFilter,
    setFilteredTransactions,
  };
}
