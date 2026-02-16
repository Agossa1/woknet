import PostgresDatabase from "./src/config/databases/configDB";

async function check() {
    const db = new PostgresDatabase();
    await db.connect();
    const result = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'messages'
    `);
    console.log(JSON.stringify(result, null, 2));
    await db.close();
}

check().catch(console.error);
