'use client';

import { User } from "@/src/features/auth/services/authTypes";
import { Mail, Lock, UserX } from "lucide-react";
import { useState } from "react";

interface AccountSectionProps {
    user: User | null;
}

import { SettingsItem } from "./SettingsItem";

export const AccountSection = ({ user: initialUser }: AccountSectionProps) => {
    const [user] = useState(initialUser);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Section Header */}
            <div>
                <h2 className="text-[22px] font-bold tracking-tight text-neutral-900 dark:text-white font-inter">Compte & Accès</h2>
                <p className="text-neutral-500 text-[13px] font-medium mt-1.5 leading-relaxed max-w-md">
                    Gérez les informations essentielles de votre compte WorkNet et vos moyens de connexion.
                </p>
            </div>

            <div className="space-y-2">
                <SettingsItem
                    icon={Mail}
                    title="Adresse email"
                    description={user?.email || "Non renseignée"}
                    subDescription="Utilisée pour la connexion et les notifications système importantes."
                    action={
                        <button className="text-[12px] font-bold text-[#0A66C2] hover:underline px-4 py-2 rounded-lg hover:bg-[#0A66C2]/5 transition-all">
                            Modifier
                        </button>
                    }
                />

                <SettingsItem
                    icon={Lock}
                    title="Mot de passe"
                    description="••••••••••••"
                    subDescription="Nous vous recommandons d'utiliser un mot de passe unique et fort."
                    action={
                        <button className="text-[12px] font-bold text-[#0A66C2] hover:underline px-4 py-2 rounded-lg hover:bg-[#0A66C2]/5 transition-all">
                            Modifier
                        </button>
                    }
                />

                {/* Danger Zone */}
                <div className="pt-10">
                    <div className="p-6 rounded-2xl border border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5">
                        <h4 className="text-[14px] font-bold text-red-600 dark:text-red-400 mb-2 font-inter">Zone de danger</h4>
                        <p className="text-[12px] text-red-500/70 font-medium mb-4 leading-relaxed max-w-md">
                            La désactivation de votre compte est temporaire. Vous pourrez le réactiver à tout moment en vous reconnectant. Toutes vos données seront conservées.
                        </p>
                        <button className="flex items-center gap-2 text-red-600 hover:text-red-700 text-[12px] font-bold transition-all px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <UserX size={15} strokeWidth={2} />
                            Désactiver le compte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
