"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const identifier = searchParams.get("identifier") || "";
    const code = searchParams.get("code") || "";

    const { resetPassword, isLoading, error, successMessage, clearAuthMessages } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAuthMessages();
        setLocalError(null);

        if (formData.password !== formData.confirmPassword) {
            setLocalError("Les mots de passe ne correspondent pas");
            return;
        }

        if (formData.password.length < 6) {
            setLocalError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        try {
            const isEmail = identifier.includes("@");
            const payload = {
                [isEmail ? "email" : "phone_number"]: identifier,
                otp_code: code,
                new_password: formData.password
            };

            await resetPassword(payload as any);
            router.push("/auth/sign-in");
        } catch (err: any) {
            setLocalError(err.message || "Une erreur s'est produite lors de la réinitialisation");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
                        <span className="text-white font-bold text-2xl">W</span>
                    </div>
                    <h1 className="text-2xl font-normal text-gray-900 dark:text-white mb-2">
                        Nouveau mot de passe
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choisissez un mot de passe sécurisé pour <span className="font-semibold text-gray-900 dark:text-gray-200">{identifier}</span>
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Messages */}
                        {(error || localError) && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    {localError || error}
                                </p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        {/* New Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 pr-20 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-white text-base bg-white dark:bg-gray-900 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
                                    placeholder="Minimum 6 caractères"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    {showPassword ? "Masquer" : "Afficher"}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 pr-20 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-white text-base bg-white dark:bg-gray-900 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
                                    placeholder="Répétez votre mot de passe"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    {showConfirmPassword ? "Masquer" : "Afficher"}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                                Votre mot de passe doit contenir :
                            </p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li className="flex items-center gap-2">
                                    <span className={formData.password.length >= 6 ? "text-green-600" : "text-gray-400"}>●</span>
                                    Au moins 6 caractères
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className={/[A-Z]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>●</span>
                                    Une lettre majuscule (recommandé)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className={/[0-9]/.test(formData.password) ? "text-green-600" : "text-gray-400"}>●</span>
                                    Un chiffre (recommandé)
                                </li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full text-base transition-colors"
                        >
                            {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                        </button>
                    </form>
                </div>

                {/* Sign In Link */}
                <div className="text-center mt-6">
                    <Link href="/auth/sign-in" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
