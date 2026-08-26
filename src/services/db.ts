import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { TransactionRecord } from '../types';

let dbInstance: duckdb.AsyncDuckDB | null = null;
let connInstance: duckdb.AsyncDuckDBConnection | null = null;

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

/**
 * Initializes and returns the dynamic DuckDB WebAssembly database & connection.
 */
export async function getDuckDB(): Promise<{ db: duckdb.AsyncDuckDB; conn: duckdb.AsyncDuckDBConnection }> {
  if (dbInstance && connInstance) {
    return { db: dbInstance, conn: connInstance };
  }

  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const conn = await db.connect();

  // Create primary transaction table schema with full forensic fields
  await conn.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      signature VARCHAR PRIMARY KEY,
      blockTime BIGINT,
      slot BIGINT,
      status VARCHAR,
      err VARCHAR,
      confirmationStatus VARCHAR,
      memo VARCHAR,
      amountSol DOUBLE,
      transactionIndex BIGINT,
      riskLevel VARCHAR,
      type VARCHAR
    );
  `);

  dbInstance = db;
  connInstance = conn;

  return { db, conn };
}

/**
 * Ingests live Solana transaction records directly into the client-side DuckDB table.
 */
export async function loadTransactionsToDuckDB(txs: TransactionRecord[]): Promise<void> {
  const { db, conn } = await getDuckDB();

  // Reset table data for fresh wallet search
  await conn.query('DELETE FROM transactions;');

  if (!txs || txs.length === 0) return;

  const normalizedData = txs.map(t => ({
    signature: t.signature,
    blockTime: Number(t.blockTime || 0),
    slot: Number(t.slot || 0),
    status: String(t.status || 'success'),
    err: t.err ? String(t.err) : '',
    confirmationStatus: String(t.confirmationStatus || 'finalized'),
    memo: t.memo ? String(t.memo) : '',
    amountSol: Number(t.amountSol || 0),
    transactionIndex: Number(t.transactionIndex || 0),
    riskLevel: String(t.riskLevel || 'LOW'),
    type: String(t.type || 'TRANSFER'),
  }));

  const jsonContent = JSON.stringify(normalizedData);
  const fileName = `txs_${Date.now()}.json`;

  await db.registerFileText(fileName, jsonContent);
  await conn.query(`
    INSERT INTO transactions
    SELECT signature, blockTime, slot, status, err, confirmationStatus, memo, amountSol, transactionIndex, riskLevel, type
    FROM read_json_auto('${fileName}');
  `);
  
  // Clean up registered file
  await db.dropFile(fileName);
}

/**
 * Executes read-only client-side SQL queries against the loaded DuckDB dataset.
 * Strictly restricts queries to SELECT statements to prevent unauthorized data manipulation.
 */
export async function runSQLQuery<T = any>(sql: string): Promise<T[]> {
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH') && !trimmed.startsWith('EXPLAIN')) {
    throw new Error('Security Restriction: Only read-only SELECT queries are permitted in the client-side SQL engine.');
  }

  const { conn } = await getDuckDB();
  const result = await conn.query(sql);
  return result.toArray().map(row => row.toJSON() as T);
}
