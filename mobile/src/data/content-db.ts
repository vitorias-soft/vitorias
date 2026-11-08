import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import embeddedSnapshot from '@/assets/content/snapshot.json';

import type { Catalog, Snapshot, SupportCategory } from './content-types';

/**
 * Réplica do conteúdo publicado, sem criptografia: é público e fica separado
 * dos relatos. Guarda JSON em colunas simples porque é sempre substituída por
 * inteiro e lida por inteiro.
 */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS violence_types (id TEXT PRIMARY KEY, slug TEXT, name TEXT, description TEXT, sort_order INTEGER);
  CREATE TABLE IF NOT EXISTS laws (id TEXT PRIMARY KEY, popular_name TEXT, number TEXT, summary TEXT, official_url TEXT, violence_type_slugs TEXT);
  CREATE TABLE IF NOT EXISTS videos (id TEXT PRIMARY KEY, title TEXT, description TEXT, youtube_url TEXT, campus TEXT);
  CREATE TABLE IF NOT EXISTS support_services (
    id TEXT PRIMARY KEY, type TEXT, category TEXT, name TEXT, address TEXT, neighborhood TEXT, city TEXT,
    state TEXT, phone TEXT, hours TEXT, latitude REAL, longitude REAL, services TEXT, verified_at TEXT
  );
`;

const VERSION_KEY = 'content_version';

const listeners = new Set<() => void>();

export function onContentChanged(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let database: Promise<SQLiteDatabase> | null = null;

function getDatabase() {
  database ??= openAndSeed().catch((error) => {
    database = null;
    throw error;
  });
  return database;
}

async function openAndSeed() {
  const db = await openDatabaseAsync('content.db');
  await db.execAsync(SCHEMA);
  if ((await readVersion(db)) === null) {
    // Primeira abertura: funciona sem internet, com o mesmo código da sincronização.
    await writeSnapshot(db, embeddedSnapshot as Snapshot);
  }
  return db;
}

async function readVersion(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', VERSION_KEY);
  return row?.value ?? null;
}

async function writeSnapshot(db: SQLiteDatabase, snapshot: Snapshot) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      DELETE FROM violence_types; DELETE FROM laws; DELETE FROM videos; DELETE FROM support_services;
    `);
    for (const t of snapshot.violenceTypes) {
      await tx.runAsync(
        'INSERT INTO violence_types VALUES (?, ?, ?, ?, ?)',
        t.id, t.slug, t.name, t.description, t.sortOrder,
      );
    }
    for (const l of snapshot.laws) {
      await tx.runAsync(
        'INSERT INTO laws VALUES (?, ?, ?, ?, ?, ?)',
        l.id, l.popularName, l.number, l.summary, l.officialUrl, JSON.stringify(l.violenceTypeSlugs),
      );
    }
    for (const v of snapshot.videos) {
      await tx.runAsync(
        'INSERT INTO videos VALUES (?, ?, ?, ?, ?)',
        v.id, v.title, v.description, v.youtubeUrl, v.campus,
      );
    }
    for (const s of snapshot.supportServices) {
      await tx.runAsync(
        'INSERT INTO support_services VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        s.id, s.type, s.category, s.name, s.address, s.neighborhood, s.city, s.state, s.phone, s.hours,
        s.latitude, s.longitude, JSON.stringify(s.services), s.verifiedAt,
      );
    }
    await tx.runAsync('INSERT OR REPLACE INTO meta VALUES (?, ?)', VERSION_KEY, snapshot.version);
  });
}

export async function getContentVersion() {
  return readVersion(await getDatabase());
}

export async function replaceContent(snapshot: Snapshot) {
  await writeSnapshot(await getDatabase(), snapshot);
  listeners.forEach((listener) => listener());
}

type LawRow = {
  id: string;
  popular_name: string;
  number: string;
  summary: string;
  official_url: string | null;
  violence_type_slugs: string;
};

type ViolenceTypeRow = { id: string; slug: string; name: string; description: string; sort_order: number };

type VideoRow = { id: string; title: string; description: string; youtube_url: string; campus: string | null };

type ServiceRow = {
  id: string;
  type: string;
  category: SupportCategory;
  name: string;
  address: string;
  neighborhood: string | null;
  city: string;
  state: string;
  phone: string | null;
  hours: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string;
  verified_at: string | null;
};

export async function readCatalog(): Promise<Catalog> {
  const db = await getDatabase();
  const [types, laws, videos, services] = await Promise.all([
    db.getAllAsync<ViolenceTypeRow>('SELECT * FROM violence_types ORDER BY sort_order, name'),
    db.getAllAsync<LawRow>('SELECT * FROM laws ORDER BY popular_name'),
    db.getAllAsync<VideoRow>('SELECT * FROM videos ORDER BY title'),
    db.getAllAsync<ServiceRow>('SELECT * FROM support_services ORDER BY name'),
  ]);

  return {
    violenceTypes: types.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      sortOrder: row.sort_order,
    })),
    laws: laws.map((row) => ({
      id: row.id,
      popularName: row.popular_name,
      number: row.number,
      summary: row.summary,
      officialUrl: row.official_url,
      violenceTypeSlugs: JSON.parse(row.violence_type_slugs) as string[],
    })),
    videos: videos.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      youtubeUrl: row.youtube_url,
      campus: row.campus,
    })),
    supportServices: services.map(({ verified_at, services: list, ...row }) => ({
      ...row,
      services: JSON.parse(list) as string[],
      verifiedAt: verified_at,
    })),
  };
}
