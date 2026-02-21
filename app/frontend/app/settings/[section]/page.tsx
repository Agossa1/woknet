'use client';

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import {
    User,
    Lock,
    Bell,
    ShieldCheck,
    Palette,
    Settings as SettingsIcon,
    ArrowLeft,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SettingsSection as SectionType } from "@/src/features/settings/settings-types";
import { AccountSection } from "@/src/features/settings/components/AccountSection";
import { PrivacySection } from "@/src/features/settings/components/PrivacySection";
import { SecuritySection } from "@/src/features/settings/components/SecuritySection";
import { NotificationsSection } from "@/src/features/settings/components/NotificationsSection";
import { DisplaySection } from "@/src/features/settings/components/DisplaySection";

export default function SettingsPage() {
    const user = useAppSelector(selectAuthUser);
    const params = useParams();
    const router = useRouter();
    const section = params.section as SectionType;
    const iconStroke = 1.25;

    const menuItems: { id: SectionType; label: string; icon: any }[] = [
        { id: 'account', label: 'Compte & Accès', icon: User },
        { id: 'security', label: 'Sécurité & 2FA', icon: Lock },
        { id: 'privacy', label: 'Confidentialité', icon: ShieldCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'display', label: 'Affichage & Langue', icon: Palette },
    ];

    const renderContent = () => {
        switch (section) {
            case 'account':
                return <AccountSection user={user} />;
            case 'privacy':
                return <PrivacySection />;
            case 'security':
                return <SecuritySection user={user} />;
            case 'notifications':
                return <NotificationsSection />;
            case 'display':
                return <DisplaySection />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-6">
                            <SettingsIcon size={28} className="text-neutral-300" strokeWidth={iconStroke} />
                        </div>
                        <h2 className="text-[17px] font-bold tracking-tight mb-2 text-neutral-900 dark:text-white font-inter">Bientôt disponible</h2>
                        <p className="text-neutral-400 text-[13px] font-medium max-w-xs">Cette section des paramètres est en cours de développement.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans antialiased text-neutral-800">
            {/* Header / Nav */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-8 h-14 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link href="/profile" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={14} strokeWidth={iconStroke} /> Retour au profil
                    </Link>
                    <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800" />
                    <div className="flex items-center gap-2">
                        <SettingsIcon size={16} className="text-[#0A66C2]" strokeWidth={iconStroke} />
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white font-inter leading-none">Paramètres</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1100px] mx-auto px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-4">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-neutral-50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Préférences</h3>
                            </div>
                            <nav className="p-2 space-y-0.5">
                                {menuItems.map((item) => {
                                    const isActive = section === item.id;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/settings/${item.id}`}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                                                ? "bg-[#0A66C2]/5 dark:bg-[#0A66C2]/10 text-[#0A66C2]"
                                                : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                                                }`}
                                        >
                                            <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-[#0A66C2]" : "text-neutral-400 group-hover:text-neutral-600 transition-colors"} />
                                            <span className={`text-[13px] font-semibold tracking-tight ${isActive ? "opacity-100" : "opacity-90"}`}>
                                                {item.label}
                                            </span>
                                            {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#0A66C2]" />}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                            <h4 className="font-bold text-[11px] uppercase tracking-widest text-neutral-400 mb-4 font-inter">Besoin d'aide ?</h4>
                            <p className="text-[12px] text-neutral-500 font-medium mb-4 leading-relaxed">Consultez notre centre d'aide pour toute question sur la gestion de votre compte.</p>
                            <a href="#" className="text-[12px] font-bold text-[#0A66C2] hover:underline flex items-center gap-1.5">
                                Accéder au support <ChevronRight size={12} strokeWidth={2} />
                            </a>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="min-h-[600px] p-8 md:p-10">
                            {renderContent()}
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}
