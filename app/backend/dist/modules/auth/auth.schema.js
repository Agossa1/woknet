"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpPasswordSchema = exports.updatePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const identifierSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone_number: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
}).refine(data => data.email || data.phone_number, {
    message: "Email or phone number is required",
    path: ["email"]
});
exports.registerSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email().optional(),
    phone_number: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    password: zod_1.z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone_number: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    password: zod_1.z.string().min(6),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone_number: zod_1.z.string().optional(),
    otp_code: zod_1.z.string().length(6),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});
exports.forgotPasswordSchema = identifierSchema;
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone_number: zod_1.z.string().optional(),
    otp_code: zod_1.z.string().length(6).optional(),
    new_password: zod_1.z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});
exports.updatePasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone_number: zod_1.z.string().optional(),
    current_password: zod_1.z.string().min(6),
    new_password: zod_1.z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});
exports.verifyOtpPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    phone_number: zod_1.z.string().optional(),
    otp_code: zod_1.z.string().length(6),
    new_password: zod_1.z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});
//# sourceMappingURL=auth.schema.js.map