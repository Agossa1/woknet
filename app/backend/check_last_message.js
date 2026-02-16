const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'jobs', // Hardcoded fallback just in case
  password: process.env.DB_PASSWORD || '19990',
  database: process.env.DB_NAME || 'work_job',
});

async function check() {
  try {
    const res = await pool.query("SELECT id, type, content, metadata FROM messages ORDER BY created_at DESC LIMIT 1;");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
