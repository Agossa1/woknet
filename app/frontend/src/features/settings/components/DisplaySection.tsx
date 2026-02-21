'use client';

import React from 'react';
import { Palette, Moon, Globe, Type } from 'lucide-react';
import { SettingsItem } from './SettingsItem';

export const DisplaySection = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-[22px] font-bold tracking-tight text-neutral-900 dark:text-white font-inter">Affichage & Langue</h2>
                <p className="text-neutral-500 text-[13px] font-medium mt-1.5 leading-relaxed max-w-md">
                    Personnalisez votre interface pour une expérience de navigation plus confortable.
                </p>
            </div>

            <div className="space-y-2">
                <SettingsItem
                    icon={Moon}
                    title="Mode sombre"
                    description="Passez d'un thème clair à un thème sombre pour soulager vos yeux."
                    action={
                        <select className="bg-transparent text-[12px] font-bold text-[#0A66C2] border-none outline-none focus:ring-0 cursor-pointer transition-colors hover:underline">
                            <option value="light">Clair</option>
                            <option value="dark">Sombre</option>
                            <option value="system">Système</option>
                        </select>
                    }
                />

                <SettingsItem
                    icon={Globe}
                    title="Langue d'affichage"
                    description="Choisissez la langue utilisée sur toute la plateforme WorkNet."
                    action={
                        <select className="bg-transparent text-[12px] font-bold text-[#0A66C2] border-none outline-none focus:ring-0 cursor-pointer transition-colors hover:underline">
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    }
                />

                <SettingsItem
                    icon={Type}
                    title="Taille de la police"
                    description="Ajustez la taille du texte pour améliorer la lisibilité."
                    action={
                        <select className="bg-transparent text-[12px] font-bold text-[#0A66C2] border-none outline-none focus:ring-0 cursor-pointer transition-colors hover:underline">
                            <option value="small">Petite</option>
                            <option value="medium">Moyenne</option>
                            <option value="large">Grande</option>
                        </select>
                    }
                />
            </div>
        </div>
    );
};
