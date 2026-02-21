'use client';

import React from 'react';
import { Bell, Mail, Smartphone, Eye } from 'lucide-react';
import { SettingsItem } from './SettingsItem';

export const NotificationsSection = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-[22px] font-bold tracking-tight text-neutral-900 dark:text-white font-inter">Notifications</h2>
                <p className="text-neutral-500 text-[13px] font-medium mt-1.5 leading-relaxed max-w-md">
                    Choisissez comment vous souhaitez être informé des activités sur votre réseau.
                </p>
            </div>

            <div className="space-y-2">
                <SettingsItem
                    icon={Mail}
                    title="Emails"
                    description="Recevez des résumés d'activité et des alertes de sécurité par email."
                    action={
                        <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-[#0A66C2] focus:ring-[#0A66C2] cursor-pointer bg-white dark:bg-neutral-800"
                        />
                    }
                />

                <SettingsItem
                    icon={Smartphone}
                    title="Push mobile"
                    description="Notifications instantanées sur votre appareil mobile pour les messages et mentions."
                    action={
                        <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-[#0A66C2] focus:ring-[#0A66C2] cursor-pointer bg-white dark:bg-neutral-800"
                        />
                    }
                />

                <SettingsItem
                    icon={Eye}
                    title="Aperçu des messages"
                    description="Afficher le contenu des messages dans les notifications push."
                    action={
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-700 text-[#0A66C2] focus:ring-[#0A66C2] cursor-pointer bg-white dark:bg-neutral-800"
                        />
                    }
                />
            </div>
        </div>
    );
};
