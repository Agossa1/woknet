import { Pool } from 'pg';
import { registerType } from 'pgvector/pg';
import databaseConfig from './databases';
import { Database } from './types';

/**
 * Implémentation PostgreSQL du service Database
 * Cette classe gère :
 * - le pool de connexions
 * - le cycle de vie de la DB
 * - l'exécution des requêtes SQL
 */
export default class PostgresDatabase implements Database {
  /**
   * Pool de connexions PostgreSQL
   * Encapsulé : inaccessible depuis l'extérieur
   */
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
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
  async connect(): Promise<void> {
    try {
      // Test basic connection
      const client = await this.pool.connect();
      try {
        await client.query("SELECT 1");

        // Vérifier si l'extension vector existe avant de l'enregistrer
        const result = await client.query(
          "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'"
        );

        if (result.rows && result.rows.length > 0) {
          // Initialisation explicite du parser pgvector seulement si l'extension existe
          await registerType(client);
          console.log(`PostgreSQL connected successfully with pgvector ${result.rows[0].extversion} ✅`);
        } else {
          console.log('PostgreSQL connected successfully (pgvector not found, skipping registration) ⚠️');
        }
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Unable to connect to PostgreSQL ❌", error);
      throw error;
    }
  }

  /**
   * Exécute une requête SQL
   * @param sql requête SQL
   * @param params paramètres SQL
   */
  async query<T>(
    sql: string,
    params: readonly unknown[] = []
  ): Promise<T[]> {
    const result = await this.pool.query(sql, params as any);
    return result.rows as T[];
  }

  /**
   * Ferme proprement le pool de connexions
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}
