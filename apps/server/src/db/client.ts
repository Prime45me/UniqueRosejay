import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10
});

export async function testDatabaseConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT 1 AS ok');
    return result.rows[0];
  } finally {
    client.release();
  }
}
