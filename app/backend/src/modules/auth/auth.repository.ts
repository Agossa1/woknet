import { RedisClientType } from "@redis/client";
import { DatabaseQueryError } from "../../errors/custom-errors";
import Logger from "../../infra/logger/winston";
import { CreateUserDTO, IDatabase, User, Role } from "./auth.types";



export interface AuthRepository {
    findByIdentifier(identifier: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    createUser(dto: CreateUserDTO): Promise<User | null>;
    verifyUserAccount(userId: string, updates: Partial<User>): Promise<User | null>;
    updateOtp(userId: string, updates: { otp_code: string, otp_expires_at: Date }): Promise<void>;
    updateLastLogin(userId: string, ipAddress?: string, metadata?: any): Promise<void>;
    clearOpt(userId: string): Promise<void>;
    updateRefreshToken(userId: string, token: string): Promise<void>;
    saveRefreshToken(userId: string, token: string): Promise<void>;
    getResetToken(email: string): Promise<string | null>;
    updatePassword(identifier: string, passwordHash: string): Promise<void>;
    forgetPassword(identifier: string): Promise<void>;
    resetPassword(identifier: string, passwordHash: string): Promise<void>;
    verifyOptPasswordReset(identifier: string, otpCode: string): Promise<boolean>;
    revoqueRefreshToken(userId: string): Promise<void>;
    saveResetToken(userId: string, token: string): Promise<void>;
    completeOnboarding(dto: any): Promise<void>;
}

export interface CreateUserPayload extends CreateUserDTO {
    roles: Role[];
    is_verified: boolean;
    is_active: boolean;
    otp_code?: string;
    otp_expires_at?: Date;
    password_hash: string;
    registration_ip?: string
    last_login_ip?: string
}


export class AuthRepository implements AuthRepository {
    constructor(
        private readonly db: IDatabase,
        private readonly logger: Logger,
        private readonly redis: RedisClientType
    ) { }


    // Récuperer l'utilisateur par email ou par numéro de téléphone

    async findByIdentifier(identifier: string): Promise<User | null> {
        try {
            const sql = `SELECT * FROM users WHERE (email = $1 OR phone_number = $1) AND deleted_at IS NULL LIMIT 1`;
            const result = await this.db.query<User>(sql, [identifier])
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("FIND_USER_BY_IDENTIFIER_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    // Récuperer l'utilisateur par ID 

    async findById(id: string): Promise<User | null> {
        try {
            const sql = `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`;
            const result = await this.db.query<User>(sql, [id]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("FIND_USER_BY_ID_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }


    // Créer un nouvel utilisateur

    async createUser(dto: CreateUserPayload): Promise<User | null> {
        try {
            const sql = `INSERT INTO users (
                full_name,
                email, 
                password_hash,
                phone_number,
                roles,
                is_verified,
                is_active,
                otp_code, 
                otp_expires_at, 
                registration_ip,
                last_login_ip
            )
            VALUES ($1, $2, $3, $4, $5::user_role[], $6, $7, $8, $9, $10, $11)
            RETURNING *`;
            const params = [
                dto.full_name,
                dto.email,
                dto.password_hash,
                dto.phone_number,
                dto.roles,
                dto.is_verified,
                dto.is_active,
                dto.otp_code,
                dto.otp_expires_at,
                dto.registration_ip,
                dto.last_login_ip
            ]
            const result = await this.db.query<User>(sql, params);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("CREATE_USER_ERROR", error);
        }
    }

    // Vérifier le compte utilisateur (après vérification OTP)
    async verifyUserAccount(userId: string, updates: Partial<User>): Promise<User | null> {
        try {
            const sql = `
            UPDATE users 
                SET is_verified = $2,
                 otp_code = $3,
                  otp_expires_at = $4,
                   verified_at = NOW()
            WHERE id = $1
            RETURNING *`;

            const params = [
                userId,
                updates.is_verified,
                updates.otp_code,
                updates.otp_expires_at
            ]

            const result = await this.db.query<User>(sql, params);

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            throw new DatabaseQueryError("VERIFY_USER_ACCOUNT_ERROR", error);
        }
    }


    // Mettre à jour le code OTP et sa date d'expiration pour un utilisateur donné (lors de la demande de réinitialisation de mot de passe)
    async updateOtp(userId: string, updates: { otp_code: string, otp_expires_at: Date }): Promise<void> {
        try {
            const sql = `UPDATE users SET otp_code = $2, otp_expires_at = $3 WHERE id = $1`;
            await this.db.query(sql, [userId, updates.otp_code, updates.otp_expires_at]);

            // On garde Redis en synchro pour la performance sur d'autres checks si besoin
            const key = `auth:otp:${userId}`;
            await this.redis.set(key, updates.otp_code, { EX: 15 * 60 }); // 15 minutes
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_OTP_ERROR", error);
        }
    }

    /**
     * Mettre à jour la date de dernière connexion et l'adresse IP de l'utilisateur après une connexion réussie
     */

    async updateLastLogin(userId: string, ipAddress?: string, metadata?: any): Promise<void> {
        try {
            if (ipAddress) {
                const sql = `UPDATE users SET last_login = NOW(), last_login_ip = $2 WHERE id = $1`;
                await this.db.query(sql, [userId, ipAddress]);
            } else {
                const sql = `UPDATE users SET last_login = NOW() WHERE id = $1`;
                await this.db.query(sql, [userId]);
            }

        } catch (error) {
            throw new DatabaseQueryError("UPDATE_LAST_LOGIN_ERROR", error);
        }
    }

    async clearOpt(userId: string): Promise<void> {
        try {
            const sql = `UPDATE users SET otp_code = NULL, otp_expires_at = NULL, is_verified = false, verified_at = NOW() WHERE id = $1 RETURNING *`;
            await this.db.query(sql, [userId]);
            const key = `auth:otp:${userId}`;
            await this.redis.del(key); // Supprimer OTP de Redis après utilisation
        } catch (error) {
            throw new DatabaseQueryError("CLEAR_OTP_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async updateRefreshToken(userId: string, token: string): Promise<void> {
        try {
            const key = `auth:refresh_token:${userId}`;
            if (token) {
                await this.redis.set(key, token, { EX: 7 * 24 * 60 * 60 }); // Stocker le token de rafraîchissement dans Redis avec une expiration de 7 jours
            } else {
                await this.redis.del(key); // Supprimer le token de rafraîchissement de Redis en cas de déconnexion
            }
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_REFRESH_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async saveRefreshToken(userId: string, token: string): Promise<void> {
        return this.updateRefreshToken(userId, token);
    }

    async saveResetToken(userId: string, token: string): Promise<void> {
        try {
            const key = `auth:reset:${userId}`;
            await this.redis.set(key, token, { EX: 24 * 60 * 60 }); // Stocker le token de réinitialisation dans Redis avec une expiration de 1 jour
        } catch (error) {
            throw new DatabaseQueryError("SAVE_RESET_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getResetToken(email: string): Promise<string | null> {
        try {
            const key = `auth:reset:${email}`;
            return await this.redis.get(key)
        } catch (error) {
            throw new DatabaseQueryError("GET_RESET_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        try {
            const sql = `UPDATE users SET password_hash =$2 WHERE id = $1`;
            await this.db.query(sql, [userId, passwordHash]);
        } catch (error) {
            throw new DatabaseQueryError("UPDATE_PASSWORD_ERROR", error);
        }
    }

    async forgetPassword(identifier: string): Promise<void> {
        try {
            const sql = `UPDATE users SET otp_code = NULL, otp_expires_at = NULL, is_verified = false, verified_at = NOW() WHERE email = $1 OR phone_number = $1 RETURNING *`;
            await this.db.query(sql, [identifier]);
            const key = `auth:otp:${identifier}`;
            await this.redis.del(key);
        } catch (error) {
            throw new DatabaseQueryError("FORGET_PASSWORD_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }


    async resetPassword(identifier: string, passwordHash: string): Promise<void> {
        try {
            const sql = `UPDATE users SET password_hash =$2 WHERE email = $1 OR phone_number = $1 RETURNING *`;
            await this.db.query(sql, [identifier, passwordHash]);
            const key = `auth:reset:${identifier}`;
            await this.redis.del(key);
        } catch (error) {
            throw new DatabaseQueryError("RESET_PASSWORD_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async verifyOptPasswordReset(identifier: string, otpCode: string): Promise<boolean> {
        try {
            const key = `auth:otp:${identifier}`;
            const storedOtp = await this.redis.get(key);
            if (storedOtp && storedOtp === otpCode) {
                await this.redis.del(key); // Supprimer OTP de Redis après vérification réussie
                return true;
            }
            return false;
        } catch (error) {
            throw new DatabaseQueryError("VERIFY_OTP_PASSWORD_RESET_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async revoqueRefreshToken(userId: string): Promise<void> {
        try {
            const key = `auth:refresh_token:${userId}`;
            await this.redis.del(key); // Supprimer le token de rafraîchissement de Redis pour révoquer l'accès
        } catch (error) {
            throw new DatabaseQueryError("REVOQUE_REFRESH_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async completeOnboarding(dto: any): Promise<void> {
        try {
            // 1. Mettre à jour l'utilisateur
            const userSql = `
                UPDATE users 
                SET headline = $2, city = $3, country = $4, industry_id = $5, job_title = $6, job_type = $7, has_onboarded = TRUE 
                WHERE id = $1
            `;
            await this.db.query(userSql, [
                dto.userId,
                dto.headline || '',
                dto.city || '',
                dto.country || '',
                dto.industry_id || null,
                dto.job_title || null,
                dto.job_type || null
            ]);

            // 2. Créer le profil s'il n'existe pas
            const profileSql = `
                INSERT INTO profiles (user_id, username, display_name)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO NOTHING
            `;

            // Génération d'un username sûr
            const baseTag = (dto.headline || 'user').toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .slice(0, 20);
            const username = `${baseTag}-${dto.userId.slice(0, 4)}`;

            // display_name max 100 chars dans le schéma
            const displayName = (dto.headline || 'Membre WorkNet').slice(0, 100);

            await this.db.query(profileSql, [dto.userId, username, displayName]);

            // 3. Ajouter l'expérience si fournie
            if (dto.company_name && dto.job_title) {
                const expSql = `
                    INSERT INTO experiences (profile_id, title, company_name, type_job, country, city, start_date, is_current)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
                `;

                // On s'assure que la date est valide
                const startDate = dto.start_date && !isNaN(Date.parse(dto.start_date))
                    ? dto.start_date
                    : new Date();

                await this.db.query(expSql, [
                    dto.userId,
                    dto.job_title,
                    dto.company_name,
                    dto.job_type || 'FULL_TIME',
                    dto.country || '',
                    dto.city || '',
                    startDate
                ]);
            }
        } catch (error) {
            this.logger.instance.error(`[AuthRepository] Onboarding Error: ${error instanceof Error ? error.message : 'Unknown'}`);
            throw new DatabaseQueryError("COMPLETE_ONBOARDING_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getAllIndustries(): Promise<any[]> {
        try {
            const sql = `SELECT * FROM industries ORDER BY category, label`;
            return await this.db.query(sql);
        } catch (error) {
            throw new DatabaseQueryError("GET_INDUSTRIES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getAllCountries(): Promise<any[]> {
        try {
            const sql = `SELECT * FROM countries ORDER BY name_fr`;
            return await this.db.query(sql);
        } catch (error) {
            throw new DatabaseQueryError("GET_COUNTRIES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getJobCatalog(): Promise<any[]> {
        try {
            const sql = `SELECT * FROM job_catalog ORDER BY title`;
            return await this.db.query(sql);
        } catch (error) {
            throw new DatabaseQueryError("GET_JOB_CATALOG_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }

    async getAllJobTypes(): Promise<any[]> {
        try {
            const sql = `SELECT * FROM job_types ORDER BY label`;
            return await this.db.query(sql);
        } catch (error) {
            throw new DatabaseQueryError("GET_JOB_TYPES_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}