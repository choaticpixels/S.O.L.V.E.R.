export interface TransactionRecord {
  signature: string;
  blockTime: number; // Unix timestamp in seconds
  slot: number;
  status: 'success' | 'failed';
  err: string | null;
  confirmationStatus: string;
  memo: string | null;
  amountSol: number;
  transactionIndex: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'TRANSFER' | 'SWAP' | 'CONTRACT' | 'FAILED';
  position?: [number, number, number];
}

export interface Node3D extends TransactionRecord {
  x: number;
  y: number;
  z: number;
  color: string;
  shape: 'sphere' | 'octahedron' | 'tetrahedron' | 'icosahedron';
}

export interface FilterOptions {
  status?: 'success' | 'failed' | 'all';
  riskLevel?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  searchQuery?: string;
  minAmount?: number;
}
