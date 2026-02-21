'use client';

import { Eye, Globe } from "lucide-react";

import { SettingsItem } from "./SettingsItem";

export const PrivacySection = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-[22px] font-bold tracking-tight text-neutral-900 dark:text-white font-inter">Confidentialité</h2>
                <p className="text-neutral-500 text-[13px] font-medium mt-1.5 leading-relaxed max-w-md">
                    Contrôlez la visibilité de vos données et qui peut interagir avec votre profil.
                </p>
            </div>

            <div className="space-y-2">
                <SettingsItem
                    icon={Eye}
                    title="Visibilité du profil"
                    description="Définissez qui peut voir vos informations et vos activités sur WorkNet."
                    action={
                        <select className="bg-transparent text-[12px] font-bold text-[#0A66C2] border-none outline-none focus:ring-0 cursor-pointer transition-colors hover:underline">
                            <option value="public">Public</option>
                            <option value="connections">Réseau</option>
                            <option value="private">Privé</option>
                        </select>
                    }
                />

                <SettingsItem
                    icon={Globe}
                    title="Liste de contacts"
                    description="Affichez ou masquez la liste de vos relations sur votre page de profil publique."
                    action={
                        <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-neutral-900 cursor-pointer bg-white dark:bg-neutral-800"
                        />
                    }
                />
            </div>
        </div>
    );
};
