"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { forgotPassword, isLoading, error, successMessage, clearAuthMessages } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAuthMessages();
        setLocalError(null);

        if (!identifier) {
            setLocalError("Veuillez entrer votre e-mail ou numéro de téléphone");
            return;
        }

        try {
            const isEmail = identifier.includes("@");
            const payload = {
                [isEmail ? "email" : "phone_number"]: identifier
            };

            await forgotPassword(payload as any);
            setSubmitted(true);
        } catch (err: any) {
            setLocalError(err.message || "Une erreur s'est produite");
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
                            <span className="text-white font-bold text-2xl">W</span>
                        </div>
                        <h1 className="text-2xl font-normal text-gray-900 dark:text-white mb-2">
                            Vérifiez votre messagerie
                        </h1>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Nous avons envoyé un code de vérification à :
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white mb-6">
                            {identifier}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Le code expirera dans 10 minutes. Si vous ne recevez rien, vérifiez vos spams.
                        </p>
                        <Link
                            href={`/auth/verify-otp?identifier=${encodeURIComponent(identifier)}`}
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-full text-base text-center transition-colors"
                        >
                            Entrer le code
                        </Link>
                    </div>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Modifier l'identifiant
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
                        <span className="text-white font-bold text-2xl">W</span>
                    </div>
                    <h1 className="text-2xl font-normal text-gray-900 dark:text-white mb-2">
                        Mot de passe oublié ?
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pas de souci, nous vous enverrons un code pour le réinitialiser
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {(error || localError) && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    {localError || error}
                                </p>
                            </div>
                        )}

                        {/* Identifier Field */}
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
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full text-base transition-colors"
                        >
                            {isLoading ? "Envoi..." : "Envoyer le code"}
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
