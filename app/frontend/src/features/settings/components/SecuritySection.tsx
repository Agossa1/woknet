'use client';

import React, { useState } from 'react';
import { Shield, Lock, Smartphone, AlertTriangle } from 'lucide-react';
import { TwoFactorModal } from './TwoFactorModal';
import { authServices } from '@/src/features/auth/services/authApi';
import { SettingsItem } from "./SettingsItem";

interface SecuritySectionProps {
    user: any;
}

export const SecuritySection = ({ user }: SecuritySectionProps) => {
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const iconStroke = 1.25;

    const handleDisable2FA = async () => {
        if (!confirm('Êtes-vous sûr de vouloir désactiver la double authentification ?')) return;

        setLoading(true);
        try {
            await authServices.disable2FA({});
            window.location.reload();
        } catch (error) {
            console.error('Failed to disable 2FA', error);
            alert('Erreur lors de la désactivation du 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-[22px] font-bold tracking-tight text-neutral-900 dark:text-white font-inter">Sécurité & 2FA</h2>
                <p className="text-neutral-500 text-[13px] font-medium mt-1.5 leading-relaxed max-w-md">
                    Renforcez la protection de votre compte avec des outils de sécurité avancés.
                </p>
            </div>

            <div className="space-y-2">
                <SettingsItem
                    icon={Smartphone}
                    title="Double Authentification (2FA)"
                    description="Ajoutez une couche de sécurité supplémentaire en demandant un code à chaque connexion."
                    action={
                        user?.two_factor_enabled ? (
                            <button
                                onClick={handleDisable2FA}
                                disabled={loading}
                                className="text-[12px] font-bold text-red-500 hover:underline px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50"
                            >
                                Désactiver
                            </button>
                        ) : (
                            <button
                                onClick={() => setIs2FAModalOpen(true)}
                                className="bg-neutral-900 dark:bg-white text-white dark:text-black text-[12px] font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm"
                            >
                                Configurer
                            </button>
                        )
                    }
                    subDescription={user?.two_factor_enabled ? "Status: Active" : "Action hautement recommandée pour protéger vos données."}
                />

                <SettingsItem
                    icon={Shield}
                    title="Sessions actives"
                    description="Vous êtes actuellement connecté sur cet appareil."
                    subDescription="Gérez et déconnectez vos sessions actives sur d'autres appareils pour plus de sécurité."
                    action={
                        <button className="text-[12px] font-bold text-[#0A66C2] hover:underline px-4 py-2 rounded-lg hover:bg-[#0A66C2]/5 transition-all">
                            Gérer
                        </button>
                    }
                />
            </div>

            {/* 2FA Modal */}
            <TwoFactorModal
                isOpen={is2FAModalOpen}
                onClose={() => setIs2FAModalOpen(false)}
                onEnabled={() => {
                    setTimeout(() => window.location.reload(), 1500);
                }}
            />
        </div>
    );
};
