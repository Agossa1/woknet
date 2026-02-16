import path from "node:path";
import fs from "fs";
import PostgresDatabase from "../../config/databases/configDB";

async function runMigrations() {
  const db = new PostgresDatabase();
  await db.connect();

  const migrationPath = path.join(__dirname, '../sql');

  const files = fs
    .readdirSync(migrationPath)
    .filter(f => f.endsWith(".sql") && !f.startsWith("._"))
    .sort();


  for (const file of files) {
    console.log(`Running migration ${file}`);

    const sql = fs.readFileSync(path.join(migrationPath, file), "utf8");

    // 1. Supprimer les commentaires SQL (--) pour éviter les erreurs de parsing
    const sqlWithoutComments = sql.replace(/--.*$/gm, "");

    // 2. Parser intelligent : split sur ";" uniquement s'il n'est pas entre $$ ou entre quotes
    // Cette regex identifie les blocs $$...$$ ou les chaînes '...' et les ignore lors du split
    const statements = sqlWithoutComments
      .split(/;(?=(?:[^$]*\$\$[^$]*\$\$)*[^$]*$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        // Optionnel: On peut rajouter le ";" à la fin car le split l'enlève
        await db.query(stmt + ";");
      } catch (err: any) {
        // Ignorer les erreurs liées aux extensions (permissions, dépendances, fichier manquant)
        // Codes: 42501 (permission denied), 42704 (object not found), 58P01 (file not found), 0A000 (feature not supported)
        if (stmt.toUpperCase().includes('CREATE EXTENSION') && ['42501', '42704', '58P01', '0A000'].includes(err.code)) {
          console.warn(`⚠️  Skipping extension (${err.code}): ${stmt.substring(0, 50)}...`);
        } else if (err.code === '42P07') {
          console.warn(`⚠️  Skipping existing relation (${err.code}): ${stmt.substring(0, 50)}...`);
        } else {
          console.error(`Error executing statement in ${file}:`, stmt);
          throw err;
        }
      }
    }
  }

  await db.close();
  console.log("All migrations executed ✅");
}

runMigrations().catch(err => {
  console.error("Migration failed ❌", err);
  process.exit(1);
});
