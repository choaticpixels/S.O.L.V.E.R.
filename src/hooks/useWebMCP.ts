import { useEffect, useState } from 'react';

interface WebMCPHooks {
  filterByStatus: (status: 'success' | 'failed' | 'all') => Promise<void>;
  highlightNode: (signature: string) => void;
  resetView: () => void;
}

export function useWebMCP({ filterByStatus, highlightNode, resetView }: WebMCPHooks) {
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
        description: 'Queries live DuckDB transaction table and updates React state to render matching nodes.',
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
                text: `Successfully executed filter_transactions for status="${targetStatus}".`,
              },
            ],
          };
        },
      };

      // 2. Tool: highlight_node
      const highlightToolDef = {
        name: 'highlight_node',
        description: 'Turns target transaction node bright yellow (#FED700) and smoothly animates camera to focus on it.',
        inputSchema: {
          type: 'object',
          properties: {
            signature: {
              type: 'string',
              description: 'Transaction base58 signature',
            },
          },
          required: ['signature'],
        },
        execute: async (args: { signature: string }) => {
          if (args?.signature) {
            highlightNode(args.signature);
            setLastAction(`highlight_node(signature="${args.signature.slice(0, 8)}...")`);
          }
          return {
            content: [
              {
                type: 'text',
                text: `Successfully focused 3D camera on transaction signature "${args?.signature}".`,
              },
            ],
          };
        },
      };

      // 3. Tool: reset_view
      const resetToolDef = {
        name: 'reset_view',
        description: 'Resets the Three.js 3D camera view and displays all transaction nodes.',
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
                text: 'Successfully reset 3D camera and cleared transaction filters.',
              },
            ],
          };
        },
      };

      if (modelContext && typeof modelContext.registerTool === 'function') {
        modelContext.registerTool(filterToolDef);
        modelContext.registerTool(highlightToolDef);
        modelContext.registerTool(resetToolDef);
      } else {
        // Fallback global window object registration for browser testing / devtools
        (window as any).__webmcp_tools__ = {
          filter_transactions: filterToolDef.execute,
          highlight_node: highlightToolDef.execute,
          reset_view: resetToolDef.execute,
        };
      }

      tools.push('filter_transactions', 'highlight_node', 'reset_view');
      setRegisteredTools(tools);
    } catch (err) {
      console.warn('WebMCP registration warning (non-fatal):', err);
    }
  }, [filterByStatus, highlightNode, resetView]);

  return {
    isSupported,
    registeredTools,
    lastAction,
  };
}
