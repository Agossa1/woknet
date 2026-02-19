'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { authServices } from '@/src/features/auth/services/authApi';

interface TwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEnabled: () => void;
}

export const TwoFactorModal = ({ isOpen, onClose, onEnabled }: TwoFactorModalProps) => {
    const [step, setStep] = useState(1);
    const [qrData, setQrData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && step === 1) {
            loadQrCode();
        }
    }, [isOpen, step]);

    const loadQrCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await authServices.setup2FA();
            setQrData(response.data);
        } catch (err: any) {
            setError(err.message || 'Impossible de générer le code QR');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!token || !qrData) return;
        setLoading(true);
        setError(null);
        try {
            const response = await authServices.enable2FA({
                secret: qrData.secret,
                token
            });
            setRecoveryCodes(response.data.recoveryCodes);
            setStep(3);
            onEnabled();
        } catch (err: any) {
            setError(err.message || 'Code invalide. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <h2 className="font-black text-[18px] tracking-tight text-neutral-900 dark:text-white">
                        {step === 3 ? 'Sauvegardez vos codes' : 'Double authentification'}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                        <UserX size={20} className="rotate-45" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 text-center">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                                    <Smartphone size={32} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[14px] text-neutral-600 dark:text-neutral-400">
                                    Scannez ce code avec une application comme Google Authenticator ou Authy.
                                </p>
                            </div>
                            <div className="flex justify-center p-4 bg-white rounded-xl border border-neutral-100">
                                {loading ? (
                                    <div className="w-[180px] h-[180px] flex items-center justify-center">
                                        <Loader2 className="animate-spin text-neutral-400" size={32} />
                                    </div>
                                ) : (
                                    qrData && <img src={qrData.qrCodeUrl} alt="QR Code 2FA" className="w-[180px] h-[180px]" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Secret Manuel</p>
                                <p className="text-[13px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 py-1.5 rounded">
                                    {qrData?.secret}
                                </p>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-xl font-bold text-[14px] hover:opacity-90 transition-opacity"
                            >
                                Suivant
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2 text-center">
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Vérification</h3>
                                <p className="text-[14px] text-neutral-500">Entrez le code à 6 chiffres affiché dans votre application.</p>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full py-4 text-center text-2xl font-black tracking-[0.5em] border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-neutral-950 dark:focus:ring-white outline-none transition-all dark:bg-neutral-800"
                                />
                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-[13px] font-medium justify-center">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-[14px] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={handleVerify}
                                        disabled={loading || token.length < 6}
                                        className="flex-1 py-3 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-xl font-bold text-[14px] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        Vérifier
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex justify-center text-green-500 bg-green-50 dark:bg-green-900/20 w-16 h-16 rounded-2xl items-center mx-auto">
                                <Shield size={32} />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">2FA activée !</h3>
                                <p className="text-[13px] text-neutral-500">
                                    Sauvegardez ces codes de récupération. Ils vous permettront d'accéder à votre compte si vous perdez votre téléphone.
                                </p>
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl font-mono text-[14px] grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400 border border-neutral-100 dark:border-neutral-700">
                                {recoveryCodes.map((code, i) => (
                                    <div key={i} className="text-center">{code}</div>
                                ))}
                            </div>
                            <button
                                onClick={copyRecoveryCodes}
                                className="w-full py-3 flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-[14px] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                            >
                                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                {copied ? 'Copié !' : 'Copier les codes'}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-xl font-bold text-[14px] hover:opacity-90 transition-opacity"
                            >
                                Terminer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple UserX replacement if Lucide doesn't have it
const UserX = ({ size, className }: { size: number, className: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
