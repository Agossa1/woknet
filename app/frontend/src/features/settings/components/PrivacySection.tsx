'use client';

import { ShieldCheck, Eye, EyeOff, Globe } from "lucide-react";

export const PrivacySection = () => {
    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-[20px] font-black tracking-tight text-neutral-950 dark:text-white">Confidentialité</h2>
                <p className="text-neutral-400 text-[13px] font-medium mt-1">Contrôlez qui peut voir vos activités et vos informations.</p>
            </div>

            <div className="space-y-4">
                {/* Profile Visibility */}
                <div className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-neutral-400">
                                <Eye size={18} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-[14px] text-neutral-900 dark:text-neutral-100">Visibilité du profil</h3>
                                <p className="text-neutral-400 text-[13px]">Tout le monde peut voir votre profil</p>
                            </div>
                        </div>
                        <select className="bg-transparent text-[12px] font-bold border-none outline-none focus:ring-0 cursor-pointer tracking-tight">
                            <option>Public</option>
                            <option>Réseau</option>
                            <option>Privé</option>
                        </select>
                    </div>
                </div>

                {/* Connections Visibility */}
                <div className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-5 hover:border-neutral-200 dark:hover:border-neutral-700 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-neutral-400">
                                <Globe size={18} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-[14px] text-neutral-900 dark:text-neutral-100">Liste de contacts</h3>
                                <p className="text-neutral-400 text-[13px]">Afficher vos relations sur votre profil</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
