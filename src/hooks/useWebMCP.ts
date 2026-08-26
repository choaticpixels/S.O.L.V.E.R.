import { useEffect, useState } from 'react';

interface WebMCPHooks {
  filterByStatus: (status: 'success' | 'failed' | 'all') => Promise<void>;
  highlightNode: (signature: string) => void;
  resetView: () => void;
  analyzeAnomalies?: () => Promise<string | null>;
  queryDuckDB?: (sql: string) => Promise<any[]>;
  setLayoutMode?: (mode: 'cluster' | 'helical') => void;
  loadWallet?: (address: string) => Promise<void>;
}

export function useWebMCP({
  filterByStatus,
  highlightNode,
  resetView,
  analyzeAnomalies,
  queryDuckDB,
  setLayoutMode,
  loadWallet,
}: WebMCPHooks) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [registeredTools, setRegisteredTools] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    const hasModelContext =
      typeof document !== 'undefined' &&
      'modelContext' in document &&
      Boolean((document as any).modelContext);

    setIsSupported(hasModelContext);
    const tools: string[] = [];

    try {
      const modelContext = hasModelContext ? (document as any).modelContext : null;

      // 1. Tool: filter_transactions
      const filterToolDef = {
        name: 'filter_transactions',
        description: 'Queries live DuckDB transaction table and updates 3D view to render matching nodes.',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'failed', 'all'],
              description: 'Transaction status filter',
            },
          },
          required: ['status'],
        },
        execute: async (args: { status: 'success' | 'failed' | 'all' }) => {
          const targetStatus = args?.status || 'all';
          await filterByStatus(targetStatus);
          setLastAction(`filter_transactions(status="${targetStatus}")`);
          return {
            content: [
              {
                type: 'text',
                text: `Successfully filtered 3D nodes for status="${targetStatus}".`,
              },
            ],
          };
        },
      };

      // 2. Tool: highlight_node
      const highlightToolDef = {
        name: 'highlight_node',
        description: 'Spotlights target transaction node in glowing gold (#FED700) and animates 3D camera to focus on it.',
        inputSchema: {
          type: 'object',
          properties: {
            signature: {
              type: 'string',
              description: 'Solana base58 transaction signature',
            },
          },
          required: ['signature'],
        },
        execute: async (args: { signature: string }) => {
          if (args?.signature) {
            highlightNode(args.signature);
            setLastAction(`highlight_node(sig="${args.signature.slice(0, 8)}...")`);
          }
          return {
            content: [
              {
                type: 'text',
                text: `Focused 3D camera on transaction signature "${args?.signature}".`,
              },
            ],
          };
        },
      };

      // 3. Tool: reset_view
      const resetToolDef = {
        name: 'reset_view',
        description: 'Resets the 3D camera position and clears all active transaction filters.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        execute: async () => {
          resetView();
          setLastAction('reset_view()');
          return {
            content: [
              {
                type: 'text',
                text: 'Reset 3D camera and cleared all transaction filters.',
              },
            ],
          };
        },
      };

      // 4. Tool: analyze_anomalies
      const anomalyToolDef = {
        name: 'analyze_anomalies',
        description: 'Performs DuckDB SQL query to detect high-risk or failed transactions and auto-focuses camera on top risk node.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        execute: async () => {
          if (analyzeAnomalies) {
            const sig = await analyzeAnomalies();
            setLastAction(`analyze_anomalies() -> ${sig ? sig.slice(0, 8) + '...' : 'clean'}`);
            return {
              content: [
                {
                  type: 'text',
                  text: sig
                    ? `Anomalies found! Auto-focused camera on high-risk transaction: ${sig}`
                    : 'No anomalous or failed transactions detected in current block batch.',
                },
              ],
            };
          }
          return { content: [{ type: 'text', text: 'Anomaly analysis engine ready.' }] };
        },
      };

      // 5. Tool: query_duckdb
      const sqlToolDef = {
        name: 'query_duckdb',
        description: 'Executes custom SQL query in in-memory DuckDB-WASM against table "transactions". Returns tabular results.',
        inputSchema: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'SQL query string, e.g. "SELECT signature, amountSol, status FROM transactions WHERE amountSol > 5"',
            },
          },
          required: ['sql'],
        },
        execute: async (args: { sql: string }) => {
          if (queryDuckDB && args?.sql) {
            try {
              const rows = await queryDuckDB(args.sql);
              setLastAction(`query_duckdb("${args.sql.slice(0, 20)}...")`);
              return {
                content: [
                  {
                    type: 'text',
                    text: `SQL Query executed successfully (${rows.length} rows returned).\n` + JSON.stringify(rows.slice(0, 5), null, 2),
                  },
                ],
              };
            } catch (err: any) {
              return {
                content: [{ type: 'text', text: `SQL Execution Error: ${err.message}` }],
              };
            }
          }
          return { content: [{ type: 'text', text: 'DuckDB SQL engine ready.' }] };
        },
      };

      // 6. Tool: set_layout_mode
      const layoutToolDef = {
        name: 'set_layout_mode',
        description: 'Switches 3D graph visualization layout between "cluster" (3D Force Graph) and "helical" (DNA Time Helix).',
        inputSchema: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['cluster', 'helical'],
              description: 'Target 3D layout mode',
            },
          },
          required: ['mode'],
        },
        execute: async (args: { mode: 'cluster' | 'helical' }) => {
          if (setLayoutMode && args?.mode) {
            setLayoutMode(args.mode);
            setLastAction(`set_layout_mode(mode="${args.mode}")`);
            return {
              content: [
                {
                  type: 'text',
                  text: `Switched 3D layout to "${args.mode}".`,
                },
              ],
            };
          }
          return { content: [{ type: 'text', text: 'Layout controller ready.' }] };
        },
      };

      // 7. Tool: select_target_wallet
      const walletToolDef = {
        name: 'select_target_wallet',
        description: 'Loads live Solana transactions for a specified wallet or program public key address into 3D DuckDB.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Solana Base58 Public Key Address',
            },
          },
          required: ['address'],
        },
        execute: async (args: { address: string }) => {
          if (loadWallet && args?.address) {
            await loadWallet(args.address);
            setLastAction(`select_target_wallet("${args.address.slice(0, 6)}...")`);
            return {
              content: [
                {
                  type: 'text',
                  text: `Loaded live Solana transactions for wallet "${args.address}".`,
                },
              ],
            };
          }
          return { content: [{ type: 'text', text: 'Wallet loader ready.' }] };
        },
      };

      if (modelContext && typeof modelContext.registerTool === 'function') {
        modelContext.registerTool(filterToolDef);
        modelContext.registerTool(highlightToolDef);
        modelContext.registerTool(resetToolDef);
        modelContext.registerTool(anomalyToolDef);
        modelContext.registerTool(sqlToolDef);
        modelContext.registerTool(layoutToolDef);
        modelContext.registerTool(walletToolDef);
      }

      // Fallback global window object registration for browser testing / devtools
      (window as any).__webmcp_tools__ = {
        filter_transactions: filterToolDef.execute,
        highlight_node: highlightToolDef.execute,
        reset_view: resetToolDef.execute,
        analyze_anomalies: anomalyToolDef.execute,
        query_duckdb: sqlToolDef.execute,
        set_layout_mode: layoutToolDef.execute,
        select_target_wallet: walletToolDef.execute,
      };

      tools.push(
        'filter_transactions',
        'highlight_node',
        'reset_view',
        'analyze_anomalies',
        'query_duckdb',
        'set_layout_mode',
        'select_target_wallet'
      );
      setRegisteredTools(tools);
    } catch (err) {
      console.warn('WebMCP registration warning (non-fatal):', err);
    }
  }, [filterByStatus, highlightNode, resetView, analyzeAnomalies, queryDuckDB, setLayoutMode, loadWallet]);

  return {
    isSupported,
    registeredTools,
    lastAction,
  };
}
