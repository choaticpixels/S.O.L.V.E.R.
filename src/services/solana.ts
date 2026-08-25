import { Connection, PublicKey } from '@solana/web3.js';
import { TransactionRecord } from '../types';

const PUBLIC_RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
  'https://solana-rpc.publicnode.com',
];

/**
 * Validates whether a string is a valid Solana PublicKey base58 address.
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const pubkey = new PublicKey(address);
    return PublicKey.isOnCurve(pubkey.toBuffer());
  } catch {
    return false;
  }
}

/**
 * Fetches the last 100 live transaction signatures for a specified wallet from Solana mainnet.
 */
export async function fetchWalletTransactions(
  addressStr: string,
  limit: number = 100,
  customRpcUrl?: string
): Promise<TransactionRecord[]> {
  const pubkey = new PublicKey(addressStr);
  const endpoints = customRpcUrl ? [customRpcUrl, ...PUBLIC_RPC_ENDPOINTS] : PUBLIC_RPC_ENDPOINTS;

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 10000,
      });

      const signatures = await connection.getSignaturesForAddress(pubkey, { limit });

      return signatures.map((sig) => {
        const isError = sig.err !== null && sig.err !== undefined;
        return {
          signature: sig.signature,
          blockTime: sig.blockTime || Math.floor(Date.now() / 1000),
          slot: sig.slot,
          status: isError ? 'failed' : 'success',
          err: sig.err ? (typeof sig.err === 'string' ? sig.err : JSON.stringify(sig.err)) : null,
          confirmationStatus: sig.confirmationStatus || 'finalized',
          memo: sig.memo || null,
        };
      });
    } catch (err: any) {
      console.warn(`RPC endpoint ${endpoint} error:`, err?.message || err);
      lastError = err;
    }
  }

  throw new Error(
    `Failed to fetch transactions from Solana RPC. ${lastError?.message ? `(${lastError.message})` : ''}`
  );
}
