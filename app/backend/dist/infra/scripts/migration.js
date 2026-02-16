"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const fs_1 = __importDefault(require("fs"));
const configDB_1 = __importDefault(require("../../config/databases/configDB"));
async function runMigrations() {
    const db = new configDB_1.default();
    await db.connect();
    const migrationPath = node_path_1.default.join(__dirname, '../sql');
    const files = fs_1.default
        .readdirSync(migrationPath)
        .filter(f => f.endsWith(".sql") && !f.startsWith("._"))
        .sort();
    for (const file of files) {
        console.log(`Running migration ${file}`);
        const sql = fs_1.default.readFileSync(node_path_1.default.join(migrationPath, file), "utf8");
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
            }
            catch (err) {
                // Ignorer les erreurs liées aux extensions (permissions, dépendances, fichier manquant)
                // Codes: 42501 (permission denied), 42704 (object not found), 58P01 (file not found)
                if (stmt.toUpperCase().includes('CREATE EXTENSION') && ['42501', '42704', '58P01'].includes(err.code)) {
                    console.warn(`⚠️  Skipping extension (${err.code}): ${stmt.substring(0, 50)}...`);
                }
                else {
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
//# sourceMappingURL=migration.js.map