"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const custom_errors_1 = require("../../errors/custom-errors");
class AuthRepository {
    constructor(db, logger, redis) {
        this.db = db;
        this.logger = logger;
        this.redis = redis;
    }
    // Récuperer l'utilisateur par email ou par numéro de téléphone
    async findByIdentifier(identifier) {
        try {
            const sql = `SELECT * FROM users WHERE email = $1 OR phone_number = $1 LIMIT 1 AND deleted_at IS NULL`;
            const result = await this.db.query(sql, [identifier]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("FIND_USER_BY_IDENTIFIER_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // Récuperer l'utilisateur par ID 
    async findById(id) {
        try {
            const sql = `SELECT * FROM users WHERE id = $1 LIMIT 1 AND deleted_at IS NULL`;
            const result = await this.db.query(sql, [id]);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("FIND_USER_BY_ID_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // Créer un nouvel utilisateur
    async createUser(dto) {
        try {
            const sql = `INSERT INTO users (
            full_name,
            email, 
            password_hash
            phone_number,
            roles,
            is_verified,
            is_active,
            otp_code, 
            otp_expires_at, 
            registration_ip,
            last_login_ip,

            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            ];
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("CREATE_USER_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // Vérifier le compte utilisateur (après vérification OTP)
    async verifyUserAccount(userId, updates) {
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
                updates.otp_expires_at,
                updates.verified_at
            ];
            const result = await this.db.query(sql, params);
            return result.length > 0 ? result[0] : null;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("VERIFY_USER_ACCOUNT_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    // Mettre à jour le code OTP et sa date d'expiration pour un utilisateur donné (lors de la demande de réinitialisation de mot de passe)
    async updateOtp(userId, updates) {
        try {
            const sql = `UPDATE users SET otp_code = $2, otp_expires_at = $3 WHERE id = $1 RETURNING *`;
            const key = `auth:otp:${userId}`;
            await this.redis.set(key, updates.otp_code, { EX: 200 }); // Stocker OTP dans Redis avec expiration de 5 minutes
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_OTP_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    /**
     * Mettre à jour la date de dernière connexion et l'adresse IP de l'utilisateur après une connexion réussie
     */
    async updateLastLogin(userId, ipAddress, metadata) {
        try {
            if (ipAddress && metadata) {
                const sql = `UPDATE users SET last_login_at = NOW(), last_login_ip = $2, last_connection_info=$3 WHERE id = $1 RETURNING *`;
                await this.db.query(sql, [userId, ipAddress, metadata]);
            }
            else if (ipAddress) {
                const sql = `UPDATE users SET last_login_at = NOW(), last_login_ip = $2 WHERE id = $1 RETURNING *`;
                await this.db.query(sql, [userId, ipAddress]);
            }
            else {
                const sql = `UPDATE users SET last_login_at = NOW() WHERE id = $1 RETURNING *`;
                await this.db.query(sql, [userId]);
            }
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_LAST_LOGIN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async clearOpt(userId) {
        try {
            const sql = `UPDATE users SET otp_code = NULL, otp_expires_at = NULL, is_verified = false, verified_at = NOW() WHERE id = $1 RETURNING *`;
            await this.db.query(sql, [userId]);
            const key = `auth:otp:${userId}`;
            await this.redis.del(key); // Supprimer OTP de Redis après utilisation
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("CLEAR_OTP_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async updateRefreshToken(userId, token) {
        try {
            const key = `auth:refresh_token:${userId}`;
            if (token) {
                await this.redis.set(key, token, { EX: 7 * 24 * 60 * 60 }); // Stocker le token de rafraîchissement dans Redis avec une expiration de 7 jours
            }
            else {
                await this.redis.del(key); // Supprimer le token de rafraîchissement de Redis en cas de déconnexion
            }
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_REFRESH_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async saveResetToken(userId, token) {
        try {
            const key = `auth:reset:${userId}`;
            await this.redis.set(key, token, { EX: 24 * 60 * 60 }); // Stocker le token de réinitialisation dans Redis avec une expiration de 1 jour
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("SAVE_RESET_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async getResetToken(email) {
        try {
            const key = `auth:reset:${email}`;
            return await this.redis.get(key);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("GET_RESET_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async updatePassword(identifier, passwordHash) {
        try {
            const sql = `UPDATE users SET password_hash =$2 WHERE email = $1 OR phone_number = $1 RETURNING *`;
            await this.db.query(sql, [identifier, passwordHash]);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("UPDATE_PASSWORD_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async forgetPassword(identifier) {
        try {
            const sql = `UPDATE users SET otp_code = NULL, otp_expires_at = NULL, is_verified = false, verified_at = NOW() WHERE email = $1 OR phone_number = $1 RETURNING *`;
            await this.db.query(sql, [identifier]);
            const key = `auth:otp:${identifier}`;
            await this.redis.del(key);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("FORGET_PASSWORD_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async resetPassword(identifier, passwordHash) {
        try {
            const sql = `UPDATE users SET password_hash =$2 WHERE email = $1 OR phone_number = $1 RETURNING *`;
            await this.db.query(sql, [identifier, passwordHash]);
            const key = `auth:reset:${identifier}`;
            await this.redis.del(key);
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("RESET_PASSWORD_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async verifyOptPasswordReset(identifier, otpCode) {
        try {
            const key = `auth:otp:${identifier}`;
            const storedOtp = await this.redis.get(key);
            if (storedOtp && storedOtp === otpCode) {
                await this.redis.del(key); // Supprimer OTP de Redis après vérification réussie
                return true;
            }
            return false;
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("VERIFY_OTP_PASSWORD_RESET_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
    async revoqueRefreshToken(userId) {
        try {
            const key = `auth:refresh_token: ${userId}`;
            await this.redis.del(key); // Supprimer le token de rafraîchissement de Redis pour révoquer l'accès
        }
        catch (error) {
            throw new custom_errors_1.DatabaseQueryError("REVOQUE_REFRESH_TOKEN_ERROR", error instanceof Error ? error.message : "Unknown error");
        }
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map