export interface TransactionRecord {
  signature: string;
  blockTime: number; // Unix timestamp in seconds
  slot: number;
  status: 'success' | 'failed';
  err: string | null;
  confirmationStatus: string;
  memo: string | null;
  position?: [number, number, number];
}

export interface Node3D extends TransactionRecord {
  x: number;
  y: number;
  z: number;
  color: string;
}

export interface FilterOptions {
  status?: 'success' | 'failed' | 'all';
  timeRange?: '1h' | '24h' | '7d' | 'all';
  searchQuery?: string;
}
