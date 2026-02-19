'use client';

import { User } from "@/src/features/auth/services/authTypes";
import { Mail, Lock, UserX, Shield, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { TwoFactorModal } from "./TwoFactorModal";
import { authServices } from "@/src/features/auth/services/authApi";
import { toast } from "sonner";

interface AccountSectionProps {
    user: User | null;
}

export const AccountSection = ({ user: initialUser }: AccountSectionProps) => {
    const [user, setUser] = useState(initialUser);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDisable2FA = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir désactiver la double authentification ?")) return;

        setLoading(true);
        try {
            await authServices.disable2FA({});
            setUser(prev => prev ? { ...prev, two_factor_enabled: false } : null);
            toast.success("Double authentification désactivée");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la désactivation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-[20px] font-black tracking-tight text-neutral-950 dark:text-white">Compte & Accès</h2>
                <p className="text-neutral-400 text-[13px] font-medium mt-1">Gérez vos identifiants et la sécurité de vos données.</p>
            </div>

            <div className="space-y-4">
                {/* Email Change */}
                <div className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                                <Mail size={18} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-[14px] text-neutral-900 dark:text-neutral-100">Adresse email</h3>
                                <p className="text-neutral-400 text-[13px]">{user?.email || "Non renseignée"}</p>
                            </div>
                        </div>
                        <button className="px-4 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded text-[12px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                            Changer
                        </button>
                    </div>
                </div>

                {/* Password Change */}
                <div className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors">
                                <Lock size={18} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-[14px] text-neutral-900 dark:text-neutral-100">Mot de passe</h3>
                                <p className="text-neutral-400 text-[13px]">Protection active</p>
                            </div>
                        </div>
                        <button className="px-4 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded text-[12px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                            Modifier
                        </button>
                    </div>
                </div>

                {/* 2FA */}
                <div className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`${user?.two_factor_enabled ? 'text-green-500' : 'text-neutral-400'} group-hover:opacity-80 transition-opacity`}>
                                <Shield size={18} />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-[14px] text-neutral-900 dark:text-neutral-100">Double authentification</h3>
                                    {user?.two_factor_enabled && (
                                        <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            Activé
                                        </span>
                                    )}
                                </div>
                                <p className="text-neutral-400 text-[13px]">Sécurité supplémentaire via application TOTP</p>
                            </div>
                        </div>
                        {user?.two_factor_enabled ? (
                            <button
                                onClick={handleDisable2FA}
                                disabled={loading}
                                className="px-4 py-1.5 border border-red-100 dark:border-red-900/20 text-red-500 rounded text-[12px] font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                            >
                                Désactiver
                            </button>
                        ) : (
                            <button
                                onClick={() => setIs2FAModalOpen(true)}
                                className="px-4 py-1.5 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded text-[12px] font-bold hover:opacity-90 transition-opacity"
                            >
                                Activer
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-6">
                    <button className="flex items-center gap-2 text-red-500/70 hover:text-red-600 text-[12px] font-bold transition-colors tracking-tight">
                        <UserX size={16} />
                        Désactiver temporairement le compte
                    </button>
                </div>
            </div>

            <TwoFactorModal
                isOpen={is2FAModalOpen}
                onClose={() => setIs2FAModalOpen(false)}
                onEnabled={() => {
                    setUser(prev => prev ? { ...prev, two_factor_enabled: true } : null);
                }}
            />
        </div>
    );
};
