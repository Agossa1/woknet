'use client';

import { useState } from "react";
import { useAppSelector } from "@/src/store/hooks";
import { selectAuthUser } from "@/src/features/auth/services/authSelectors";
import {
    User,
    Lock,
    Bell,
    ShieldCheck,
    Palette,
    ChevronRight,
    Settings as SettingsIcon,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { SettingsSection } from "@/src/features/settings/settings-types";
import { AccountSection } from "@/src/features/settings/components/AccountSection";
import { PrivacySection } from "@/src/features/settings/components/PrivacySection";

export default function SettingsPage() {
    const user = useAppSelector(selectAuthUser);
    const [activeTab, setActiveTab] = useState<SettingsSection>('account');

    const menuItems: { id: SettingsSection; label: string; icon: any; color: string }[] = [
        { id: 'account', label: 'Compte & Accès', icon: User, color: 'text-neutral-900 dark:text-white' },
        { id: 'security', label: 'Sécurité & 2FA', icon: Lock, color: 'text-neutral-900 dark:text-white' },
        { id: 'privacy', label: 'Confidentialité', icon: ShieldCheck, color: 'text-neutral-900 dark:text-white' },
        { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-neutral-900 dark:text-white' },
        { id: 'display', label: 'Affichage & Langue', icon: Palette, color: 'text-neutral-900 dark:text-white' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return <AccountSection user={user} />;
            case 'privacy':
                return <PrivacySection />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-6">
                            <SettingsIcon size={28} className="text-neutral-300" />
                        </div>
                        <h2 className="text-[16px] font-black tracking-widest mb-2 text-neutral-900 dark:text-white">Bientôt disponible</h2>
                        <p className="text-neutral-400 text-[13px] font-medium max-w-xs">Cette section des paramètres est en cours de développement.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black font-inter">
            <div className="max-w-[1100px] mx-auto px-4 py-12">

                {/* Header Navigation */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-neutral-100 dark:border-neutral-900 pb-8">
                    <div className="flex items-center gap-5">
                        <Link
                            href="/profile"
                            className="p-2.5 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all text-neutral-400"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter text-neutral-950 dark:text-white">Paramètres</h1>
                                <span className="px-2 py-0.5 bg-neutral-950 dark:bg-white text-white dark:text-black text-[9px] font-black uppercase rounded tracking-wider">Bêta</span>
                            </div>
                            <p className="text-neutral-400 text-[13px] font-medium mt-1">Gérez votre expérience et la sécurité de votre compte WorkNet.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Menu */}
                    <aside className="w-full lg:w-[280px] shrink-0">
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-lg transition-all group ${activeTab === item.id
                                        ? "bg-neutral-50 dark:bg-neutral-900 text-neutral-950 dark:text-white"
                                        : "hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`transition-colors ${activeTab === item.id ? 'text-neutral-950 dark:text-white' : 'text-neutral-300 group-hover:text-neutral-500'}`}>
                                            <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
                                        </div>
                                        <span className={`text-[13px] font-bold tracking-tight ${activeTab === item.id ? 'opacity-100' : 'opacity-80'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {activeTab === item.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950 dark:bg-white animate-in zoom-in duration-300" />
                                    )}
                                </button>
                            ))}
                        </nav>

                        <div className="mt-12 pt-8 border-t border-neutral-100 dark:border-neutral-900">
                            <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-neutral-300 mb-4">Assistance</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-[12px] font-bold text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors">Centre d'aide</a></li>
                                <li><a href="#" className="text-[12px] font-bold text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors">Confidentialité</a></li>
                                <li><a href="#" className="text-[12px] font-bold text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors">Conditions d'utilisation</a></li>
                            </ul>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <div className="min-h-[500px]">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
