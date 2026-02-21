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
    const iconStroke = 1.25;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                    <h2 className="font-bold text-[20px] tracking-tight text-neutral-900 dark:text-white font-inter">
                        {step === 3 ? 'Codes de secours' : 'Double authentification'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-500 transition-colors">
                        <UserX size={20} strokeWidth={iconStroke} className="rotate-45" />
                    </button>
                </div>

                <div className="px-8 pb-10">
                    {step === 1 && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-[14px] text-neutral-500 font-medium leading-relaxed">
                                    Capturez ce QR code avec Google Authenticator ou une application similaire.
                                </p>
                                <div className="flex justify-center p-5 bg-white dark:bg-white rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                    {loading ? (
                                        <div className="w-[180px] h-[180px] flex items-center justify-center">
                                            <Loader2 className="animate-spin text-neutral-300" size={32} strokeWidth={iconStroke} />
                                        </div>
                                    ) : (
                                        qrData && <img src={qrData.qrCodeUrl} alt="QR Code" className="w-[180px] h-[180px]" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">Code secret manuel</label>
                                <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                                    <code className="text-[13px] font-mono font-bold text-neutral-700 dark:text-neutral-300">{qrData?.secret}</code>
                                    <button
                                        onClick={() => qrData && navigator.clipboard.writeText(qrData.secret)}
                                        className="text-[#0A66C2] text-xs font-bold hover:underline"
                                    >
                                        Copier
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[14px] hover:opacity-90 transition-all shadow-sm shadow-neutral-200 dark:shadow-none"
                            >
                                J'ai scanné le code
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 py-4">
                            <div className="space-y-2">
                                <h3 className="text-[15px] font-bold text-neutral-900 dark:text-white font-inter">Code de vérification</h3>
                                <p className="text-[13px] text-neutral-500 font-medium">Saisissez les 6 chiffres générés par votre application.</p>
                            </div>

                            <div className="space-y-6">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000 000"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="w-full py-5 text-center text-3xl font-bold tracking-[0.3em] bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl focus:ring-2 focus:ring-[#0A66C2] outline-none transition-all dark:text-white placeholder:opacity-20"
                                    autoFocus
                                />
                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-xl text-[13px] font-bold border border-red-100 dark:border-red-900/20">
                                        <AlertCircle size={14} strokeWidth={2} />
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-[14px] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={handleVerify}
                                        disabled={loading || token.length < 6}
                                        className="flex-[2] py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[14px] hover:opacity-90 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 size={16} className="animate-spin" />}
                                        Activer le 2FA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 py-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Shield size={32} strokeWidth={iconStroke} />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-[18px] font-bold text-neutral-900 dark:text-white font-inter">Authentification configurée</h3>
                                <p className="text-[13px] text-neutral-500 font-medium leading-relaxed">
                                    Gardez ces codes précieusement. Ils permettent l'accès à votre compte en cas de perte de votre appareil.
                                </p>
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl font-mono text-[14px] font-bold grid grid-cols-2 gap-y-3 gap-x-8 text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800/50 shadow-inner">
                                {recoveryCodes.map((code, i) => (
                                    <div key={i} className="text-center tracking-wider">{code}</div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={copyRecoveryCodes}
                                    className="w-full py-3.5 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-[14px] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm"
                                >
                                    {copied ? <Check size={18} strokeWidth={2} className="text-emerald-500" /> : <Copy size={18} strokeWidth={iconStroke} />}
                                    {copied ? 'Codes copiés !' : 'Copier tous les codes'}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[14px] hover:opacity-90 transition-all"
                                >
                                    Terminer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserX = ({ size, className, strokeWidth = 2 }: { size: number, className: string, strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
