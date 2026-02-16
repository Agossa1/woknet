import dotenv from 'dotenv';
import { Pool } from 'pg';
import { registerType } from 'pgvector/pg';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
  database: process.env.DB_DATABASE || process.env.POSTGRES_DB || 'worknet_db',
});

async function run() {
  const client = await pool.connect();
  try {
    const r = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname='vector'");
    if (r.rowCount) {
      await registerType(client);
      console.log('pgvector is installed:', r.rows[0]);
    } else {
      console.log('pgvector not installed in DB');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
