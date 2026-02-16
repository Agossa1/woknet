import { z } from "zod";


const identifierSchema = z.object({
    email: z.string().email().optional(),
    phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
}).refine(data => data.email || data.phone_number, {
    message: "Email or phone number is required",
    path: ["email"]
});

export const registerSchema = z.object({
    full_name: z.string().min(3).max(50),
    email: z.string().email().optional(),
    phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    password: z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});

export const loginSchema = z.object({
    email: z.string().email().optional(),
    phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    password: z.string().min(6),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});

export const verifyOtpSchema = z.object({
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    otp_code: z.string().length(6),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});

export const forgotPasswordSchema = identifierSchema;

export const resetPasswordSchema = z.object({
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    otp_code: z.string().length(6).optional(),
    new_password: z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});

export const updatePasswordSchema = z.object({
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    current_password: z.string().min(6),
    new_password: z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});

export const verifyOtpPasswordSchema = z.object({
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    otp_code: z.string().length(6),
    new_password: z.string()
        .min(6)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
}).refine(data => data.email || data.phone_number, {
    message: "L'email ou le numéro de téléphone est requis",
    path: ["email"]
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
