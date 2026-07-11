import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './schema';
import { config } from '../config';

let db: Kysely<Database> | null = null;

export function createDb(connectionString = config.DATABASE_URL): Kysely<Database> {
  const pool = new Pool({ connectionString });
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool: pool as never }),
  });
}

export function getDb(): Kysely<Database> {
  if (!db) {
    db = createDb();
  }
  return db;
}

export function setDb(instance: Kysely<Database>): void {
  db = instance;
}

export async function destroyDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}
