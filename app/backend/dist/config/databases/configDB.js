"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pg_2 = require("pgvector/pg");
const databases_1 = __importDefault(require("./databases"));
/**
 * Implémentation PostgreSQL du service Database
 * Cette classe gère :
 * - le pool de connexions
 * - le cycle de vie de la DB
 * - l'exécution des requêtes SQL
 */
class PostgresDatabase {
    constructor() {
        this.pool = new pg_1.Pool({
            host: databases_1.default.host,
            port: databases_1.default.port,
            user: databases_1.default.user,
            password: databases_1.default.password,
            database: databases_1.default.database,
        });
        /**
         * Gestion des erreurs du pool
         * (ex: connexion perdue)
         */
        this.pool.on("error", (error) => {
            console.error("PostgreSQL pool error", error);
            process.exit(1);
        });
    }
    /**
     * Vérifie que la base est accessible au démarrage
     * Fail fast si la DB n'est pas disponible
     */
    async connect() {
        try {
            // Test basic connection
            const client = await this.pool.connect();
            try {
                await client.query("SELECT 1");
                // Vérifier si l'extension vector existe avant de l'enregistrer
                const result = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'");
                if (result.rows && result.rows.length > 0) {
                    // Initialisation explicite du parser pgvector seulement si l'extension existe
                    await (0, pg_2.registerType)(client);
                    console.log(`PostgreSQL connected successfully with pgvector ${result.rows[0].extversion} ✅`);
                }
                else {
                    console.log('PostgreSQL connected successfully (pgvector not found, skipping registration) ⚠️');
                }
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            console.error("Unable to connect to PostgreSQL ❌", error);
            throw error;
        }
    }
    /**
     * Exécute une requête SQL
     * @param sql requête SQL
     * @param params paramètres SQL
     */
    async query(sql, params = []) {
        const result = await this.pool.query(sql, params);
        return result.rows;
    }
    /**
     * Ferme proprement le pool de connexions
     */
    async close() {
        await this.pool.end();
    }
}
exports.default = PostgresDatabase;
//# sourceMappingURL=configDB.js.map