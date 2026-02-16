'use client';

import { Plus } from "lucide-react";
import { ProfileData as Profile } from "@/src/features/profiles/services/profile-types";

interface ProfileAboutProps {
    profile: Profile | null;
}

export const ProfileAbout = ({ profile }: ProfileAboutProps) => {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">À Propos</h2>
                <button className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    <Plus size={18} />
                </button>
            </div>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                {profile?.bio || "Partagez votre histoire et vos aspirations professionnelles pour inspirer le réseau."}
            </div>
        </section>
    );
};
