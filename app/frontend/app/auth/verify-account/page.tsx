"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

function VerifyAccountContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const identifier = searchParams.get("identifier") || "";

    const { verifyAccount, resendCodeOtp, isLoading, error, successMessage, clearAuthMessages } = useAuth();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [verified, setVerified] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        const digits = pastedData.match(/\d/g) || [];

        const newOtp = [...otp];
        digits.forEach((digit, index) => {
            if (index < 6) newOtp[index] = digit;
        });
        setOtp(newOtp);

        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAuthMessages();
        setLocalError(null);

        const code = otp.join("");
        if (code.length === 6) {
            try {
                const isEmail = identifier.includes("@");
                const payload = {
                    [isEmail ? "email" : "phone_number"]: identifier,
                    otp_code: code
                };

                await verifyAccount(payload as any);
                setVerified(true);
                setTimeout(() => {
                    router.push("/feed");
                }, 2000);
            } catch (err: any) {
                setLocalError(err.message || "Code de vérification invalide");
            }
        }
    };

    const handleResend = async () => {
        clearAuthMessages();
        setLocalError(null);
        try {
            const isEmail = identifier.includes("@");
            const payload = {
                [isEmail ? "email" : "phone_number"]: identifier
            };
            await resendCodeOtp(payload as any);
        } catch (err: any) {
            setLocalError(err.message || "Impossible de renvoyer le code");
        }
    };

    if (verified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
                <div className="w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        Compte vérifié !
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Votre compte a été vérifié avec succès. Vous allez être redirigé...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                        Vérifiez votre compte
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Un code de vérification a été envoyé à : <span className="font-semibold">{identifier}</span>
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Messages */}
                        {(error || localError) && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-center">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    {localError || error}
                                </p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 text-center">
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        {/* Info Message */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                Pour activer votre compte et accéder à toutes les fonctionnalités de WorkNet, veuillez entrer le code de vérification.
                            </p>
                        </div>

                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-3 text-center">
                                Code de vérification
                            </label>
                            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-xl font-semibold border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || otp.join("").length !== 6}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full text-base transition-colors"
                        >
                            {isLoading ? "Vérification..." : "Vérifier mon compte"}
                        </button>

                        {/* Resend Code */}
                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Vous n'avez pas reçu le code ?
                            </p>
                            <div className="flex items-center justify-center gap-4 text-sm">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="font-semibold text-blue-600 hover:underline dark:text-blue-400 disabled:text-gray-400"
                                    disabled={isLoading}
                                >
                                    Renvoyer le code
                                </button>
                                <span className="text-gray-400">•</span>
                                <Link href="/help/verification" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                                    Besoin d'aide ?
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Back to Sign In */}
                <div className="text-center mt-6">
                    <Link href="/auth/sign-in" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyAccountPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <VerifyAccountContent />
        </Suspense>
    );
}
