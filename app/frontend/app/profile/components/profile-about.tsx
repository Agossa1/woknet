'use client';

import { Plus } from "lucide-react";
import { ProfileData as Profile } from "@/src/features/profiles/services/profile-types";

interface ProfileAboutProps {
    profile: Profile | null;
}

export const ProfileAbout = ({ profile }: ProfileAboutProps) => {
    return (
        <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter">Infos</h2>
                <button className="p-1.5 text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full transition-colors">
                    <Plus size={18} />
                </button>
            </div>
            <div className="text-[14px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {profile?.bio || "Partagez votre histoire et vos aspirations professionnelles pour inspirer le réseau."}
            </div>
        </div>
    );
};
