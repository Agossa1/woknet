"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordService = exports.PasswordService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Service gérant la sécurité des mots de passe.
 * Utilise bcryptjs pour le hachage asynchrone.
 */
class PasswordService {
    /**
     * @param hasher - L'instance de bcrypt (permet de mock pour les tests unitaires)
     */
    constructor(hasher = bcryptjs_1.default, pepper = process.env.PASSWORD_PEPPER || "") {
        this.hasher = hasher;
        this.pepper = pepper;
        this.SALT_ROUNDS = 10;
        this.MAX_PASSWORD_LENGTH = 128;
        if (!this.pepper) {
            console.warn("⚠️  WARNING: PASSWORD_PEPPER is not set in environment variables. This reduces password security. Please set a strong pepper value.");
        }
    }
    /**
     * Transforme un mot de passe en clair en hash sécurisé.
     * @param password - Le mot de passe saisi par l'utilisateur
     * @returns Le hash résultant
     */
    async hashPassword(password) {
        if (password.length > this.MAX_PASSWORD_LENGTH) {
            throw new Error(`Password exceeds maximum length of ${this.MAX_PASSWORD_LENGTH} characters.`);
        }
        const passwordWithPepper = password + this.pepper;
        return this.hasher.hash(passwordWithPepper, this.SALT_ROUNDS);
    }
    /**
     * Compare un mot de passe en clair avec un hash stocké.
     * @param password - Mot de passe à tester
     * @param hash - Hash stocké en base de données
     * @returns boolean - True si les mots de passe correspondent
     */
    async comparePassword(password, hash) {
        if (password.length > this.MAX_PASSWORD_LENGTH) {
            return false;
        }
        const passwordWithPepper = password + this.pepper;
        return this.hasher.compare(passwordWithPepper, hash);
    }
}
exports.PasswordService = PasswordService;
/**
 * Instance Singleton prête à l'emploi
 */
exports.passwordService = new PasswordService();
//# sourceMappingURL=passwordServices.js.map