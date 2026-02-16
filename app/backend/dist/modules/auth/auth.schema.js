"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpPasswordSchema = exports.updatePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(3).max(50).describe("Le nom complet doit comporter entre 3 et 50 caractères"),
    email: zod_1.z.string().email().describe("L'email doit être valide"),
    phone_number: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().describe("Le numéro de téléphone doit être valide"),
    password: zod_1.z.string().min(6).describe("Le mot de passe doit comporter au moins 6 caractères").regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).describe("Le mot de passe doit contenir au moins une lettre et un chiffre"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().describe("L'email doit être valide"),
    password: zod_1.z.string().min(6).describe("Le mot de passe doit comporter au moins 6 caractères"),
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email().describe("L'email doit être valide"),
    otp_code: zod_1.z.string().length(6).describe("Le code OTP doit comporter exactement 6 caractères"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().describe("L'email doit être valide"),
    phone_number: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().describe("Le numéro de téléphone doit être valide"),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().describe("L'email doit être valide"),
    new_password: zod_1.z.string().min(6).describe("Le mot de passe doit comporter au moins 6 caractères").regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).describe("Le mot de passe doit contenir au moins une lettre et un chiffre"),
});
exports.updatePasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().describe("L'email doit être valide"),
    current_password: zod_1.z.string().min(6).describe("Le mot de passe actuel doit comporter au moins 6 caractères"),
    new_password: zod_1.z.string().min(6).describe("Le nouveau mot de passe doit comporter au moins 6 caractères").regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).describe("Le nouveau mot de passe doit contenir au moins une lettre et un chiffre"),
});
exports.verifyOtpPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().describe("L'email doit être valide"),
    otp_code: zod_1.z.string().length(6).describe("Le code OTP doit comporter exactement 6 caractères"),
    new_password: zod_1.z.string().min(6).describe("Le nouveau mot de passe doit comporter au moins 6 caractères").regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/).describe("Le nouveau mot de passe doit contenir au moins une lettre et un chiffre"),
});
//# sourceMappingURL=auth.schema.js.map