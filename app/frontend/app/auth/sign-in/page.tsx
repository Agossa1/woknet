"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { z } from "zod";

const loginSchema = z.object({
    identifier: z.string().min(1, "L'identifiant est requis"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    rememberMe: z.boolean().optional()
});

export default function SignInPage() {
    const router = useRouter();
    const { login, isLoading, error, successMessage, clearAuthMessages } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
        rememberMe: false
    });
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAuthMessages();
        setLocalError(null);

        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            setLocalError(result.error.issues[0].message);
            return;
        }

        try {
            const isEmail = formData.identifier.includes("@");
            const payload = {
                [isEmail ? "email" : "phone_number"]: formData.identifier,
                password: formData.password
            };

            await login(payload as any);
            router.push("/feed");
        } catch (err: any) {
            setLocalError(err.message || "Une erreur s'est produite lors de la connexion");
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
                    <h1 className="text-3xl font-normal text-gray-900 dark:text-white">
                        Bon retour !
                    </h1>
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

                        {/* Email Field */}
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1">
                                E-mail ou téléphone
                            </label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-white text-base bg-white dark:bg-gray-900 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
                                placeholder="votre@email.com"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-3 py-2 pr-20 border border-gray-400 dark:border-gray-600 rounded text-gray-900 dark:text-white text-base bg-white dark:bg-gray-900 focus:outline-none focus:border-gray-900 dark:focus:border-gray-400"
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

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Se souvenir de moi
                                </span>
                            </label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full text-base transition-colors"
                        >
                            {isLoading ? "Connexion..." : "S'identifier"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">ou</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 border border-gray-400 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2.5 px-4 rounded-full text-base transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                        </svg>
                        Continuer avec Google
                    </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Nouveau sur WorkNet ?{' '}
                        <Link href="/auth/sign-up" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
