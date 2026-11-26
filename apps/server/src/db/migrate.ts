import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../config/env.js';

/*
 * Forward-only SQL migration runner.
 *
 *   npm run db:migrate -w apps/server            apply pending migrations
 *   npm run db:migrate -w apps/server -- --status list applied / pending without changing anything
 *
 * - Migrations are plain .sql files in apps/server/migrations, applied in filename order
 *   (NNNN_description.sql).
 * - Each file runs inside its own transaction and is recorded in schema_migrations with a checksum.
 * - Editing an already-applied file is refused: add a new migration instead.
 * - An advisory lock stops two runners applying migrations at the same time.
 * - The runner never drops or recreates tables on its own; destructive changes must be written
 *   explicitly in a reviewed migration.
 */

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = resolve(here, '../../migrations');
const LOCK_ID = 7_418_202_611;

interface Migration {
  name: string;
  sql: string;
  checksum: string;
}

async function loadMigrations(): Promise<Migration[]> {
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => /^\d{4}_[a-z0-9_]+\.sql$/.test(file)).sort();
  return Promise.all(
    files.map(async (name) => {
      const sql = await readFile(resolve(MIGRATIONS_DIR, name), 'utf8');
      return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') };
    })
  );
}

async function main() {
  const statusOnly = process.argv.includes('--status');
  const client = new pg.Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name        text PRIMARY KEY,
        checksum    text NOT NULL,
        applied_at  timestamptz NOT NULL DEFAULT now()
      )`);

    const applied = new Map(
      (await client.query<{ name: string; checksum: string }>('SELECT name, checksum FROM schema_migrations')).rows.map(
        (row) => [row.name, row.checksum]
      )
    );
    const migrations = await loadMigrations();

    for (const migration of migrations) {
      const recorded = applied.get(migration.name);
      if (recorded && recorded !== migration.checksum) {
        throw new Error(`Migration ${migration.name} was modified after it was applied. Create a new migration instead.`);
      }
    }

    const pending = migrations.filter((migration) => !applied.has(migration.name));
    if (statusOnly) {
      console.log(`Applied: ${applied.size}. Pending: ${pending.length}.`);
      pending.forEach((migration) => console.log(`  pending  ${migration.name}`));
      return;
    }

    if (pending.length === 0) {
      console.log('Database is up to date.');
      return;
    }

    for (const migration of pending) {
      console.log(`Applying ${migration.name} …`);
      await client.query('BEGIN');
      try {
        await client.query(migration.sql);
        await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [migration.name, migration.checksum]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${migration.name} failed and was rolled back: ${(error as Error).message}`);
      }
    }
    console.log(`Applied ${pending.length} migration(s).`);
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => undefined);
    await client.end();
  }
}

main().catch((error: Error & { code?: string }) => {
  const hints: Record<string, string> = {
    ECONNREFUSED: 'Nothing is listening at the host/port in DATABASE_URL. Check the PostgreSQL port.',
    '28P01': 'PostgreSQL rejected the username or password in DATABASE_URL.',
    '3D000': 'The database named in DATABASE_URL does not exist. Create it first.'
  };
  console.error(`Migration failed${error.code ? ` (${error.code})` : ''}: ${error.message || hints[error.code ?? ''] || 'unknown error'}`);
  if (error.code && hints[error.code] && error.message) console.error(hints[error.code]);
  process.exitCode = 1;
});
