'use client';

import { Mail, Globe, CircleDot, Calendar } from "lucide-react";
import { User } from "@/src/features/auth/services/authTypes";
import { ProfileData as Profile } from "@/src/features/profiles/services/profile-types";

const iconStroke = 1.25;

interface ProfileInfoCardProps {
    user: User;
    profile: Profile | null;
}

export const ProfileInfoCard = ({ user, profile }: ProfileInfoCardProps) => {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm space-y-5">
            <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter">Informations clés</h3>

            <div className="space-y-5">
                {/* Site Web */}
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-neutral-400 dark:text-neutral-500">
                        <Globe size={18} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">Site web</span>
                        <a
                            href={profile?.website_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] font-medium text-neutral-900 dark:text-white hover:text-[#0A66C2] transition-colors"
                        >
                            {profile?.website_url ? new URL(profile.website_url).hostname : "Non renseigné"}
                        </a>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-neutral-400 dark:text-neutral-500">
                        <Mail size={16} strokeWidth={iconStroke} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">Email professionnel</span>
                        <span className="text-[13px] font-medium text-neutral-900 dark:text-white">
                            {user.email || "philosophiestoique@gmail.com"}
                        </span>
                    </div>
                </div>

                {/* Statut Membre */}
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-neutral-400 dark:text-neutral-500">
                        <CircleDot size={16} strokeWidth={iconStroke} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">Réseau</span>
                        <span className="text-[13px] font-medium text-neutral-900 dark:text-white">Membre {user.industry_id}</span>
                    </div>
                </div>

                {/* Date d'inscription */}
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-neutral-400 dark:text-neutral-500">
                        <Calendar size={16} strokeWidth={iconStroke} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">Adhésion</span>
                        <span className="text-[13px] font-medium text-neutral-900 dark:text-white">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase()) : 'Février 2026'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
