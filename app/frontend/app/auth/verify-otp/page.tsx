"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const identifier = searchParams.get("identifier") || "";

    const { verifyOtpPasswordReset, resendCodeOtp, isLoading, error, successMessage, clearAuthMessages } = useAuth();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
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

                await verifyOtpPasswordReset(payload as any);
                router.push(`/auth/reset-password?identifier=${encodeURIComponent(identifier)}&code=${code}`);
            } catch (err: any) {
                setLocalError(err.message || "Code invalide ou expiré");
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
                        <span className="text-white font-bold text-2xl">W</span>
                    </div>
                    <h1 className="text-2xl font-normal text-gray-900 dark:text-white mb-2">
                        Vérification du code
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Nous avons envoyé un code à 6 chiffres à : <span className="font-semibold">{identifier}</span>
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

                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-normal text-gray-700 dark:text-gray-300 mb-3 text-center">
                                Entrez le code de vérification
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
                            {isLoading ? "Vérification..." : "Vérifier le code"}
                        </button>

                        {/* Resend Code */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Vous n'avez pas reçu le code ?
                            </p>
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400 disabled:text-gray-400"
                                disabled={isLoading}
                            >
                                Renvoyer le code
                            </button>
                        </div>
                    </form>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link href="/auth/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
                        Retour
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
