import { getRandomBytes, randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

/** Relatos ficam só no aparelho, em SQLCipher (AES-256). Nunca saem daqui. */

export type ReportPerspective = 'first' | 'third';

export type Report = {
  id: string;
  perspective: ReportPerspective;
  reporterName: string | null;
  relationship: string | null;
  description: string;
  occurredAtText: string | null;
  createdAt: string;
};

export type NewReport = Omit<Report, 'id' | 'createdAt'>;

export class EncryptionUnavailableError extends Error {}

const KEY_NAME = 'relatos_key';

async function getOrCreateKey() {
  const existing = await SecureStore.getItemAsync(KEY_NAME);
  if (existing) return existing;
  const hex = Array.from(getRandomBytes(32), (byte) => byte.toString(16).padStart(2, '0')).join('');
  await SecureStore.setItemAsync(KEY_NAME, hex);
  return hex;
}

let database: Promise<SQLiteDatabase> | null = null;

function getDatabase() {
  database ??= open().catch((error) => {
    database = null;
    throw error;
  });
  return database;
}

async function open() {
  const db = await openDatabaseAsync('relatos.db');
  // Sem SQLCipher no binário, `PRAGMA key` não faz nada e não dá erro: o relato
  // seria gravado em texto puro. Nesse caso, recusar é a única opção segura.
  const cipher = await db.getFirstAsync<{ cipher_version: string }>('PRAGMA cipher_version');
  if (!cipher) {
    await db.closeAsync();
    throw new EncryptionUnavailableError();
  }

  const key = await getOrCreateKey();
  await db.execAsync(`PRAGMA key = "x'${key}'"`);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY NOT NULL,
      perspective TEXT NOT NULL,
      reporter_name TEXT,
      relationship TEXT,
      description TEXT NOT NULL,
      occurred_at_text TEXT,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

export async function saveReport(report: NewReport) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?, ?)',
    randomUUID(),
    report.perspective,
    report.reporterName,
    report.relationship,
    report.description,
    report.occurredAtText,
    new Date().toISOString(),
  );
}

type ReportRow = {
  id: string;
  perspective: ReportPerspective;
  reporter_name: string | null;
  relationship: string | null;
  description: string;
  occurred_at_text: string | null;
  created_at: string;
};

export async function listReports(): Promise<Report[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ReportRow>('SELECT * FROM reports ORDER BY created_at DESC');
  return rows.map((row) => ({
    id: row.id,
    perspective: row.perspective,
    reporterName: row.reporter_name,
    relationship: row.relationship,
    description: row.description,
    occurredAtText: row.occurred_at_text,
    createdAt: row.created_at,
  }));
}

export async function deleteReport(id: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM reports WHERE id = ?', id);
}

export async function deleteAllReports() {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM reports');
}
