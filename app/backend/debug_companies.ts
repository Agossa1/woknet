
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root of the backend
dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres', // Default to postgres if not set
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'worknet',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function debugCompanies() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        try {
            console.log('Querying companies table...');
            const result = await client.query(`
                SELECT id, name, slug, deleted_at 
                FROM companies 
                ORDER BY created_at DESC
            `);

            console.log('Companies found:', result.rows.length);
            console.table(result.rows);

            // Check specific slug: ben-market
            const specificResult = await client.query(`
                SELECT * FROM companies WHERE slug = 'ben-market'
            `);
            console.log('Searching for ben-market:', specificResult.rows);

        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
}

debugCompanies();
