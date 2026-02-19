'use client';

import {
    Mail, CircleDot, Twitter, Github, Linkedin, Instagram, Youtube,
    MessageCircle, MapPin, Link as LinkIcon, Calendar
} from "lucide-react";
import { User } from "@/src/features/auth/services/authTypes";
import { ProfileData as Profile } from "@/src/features/profiles/services/profile-types";

interface ProfileContactBarProps {
    user: User;
    profile: Profile | null;
}

export const ProfileContactBar = ({ user, profile }: ProfileContactBarProps) => {
    return (
        <div className="flex flex-col gap-5">
            {/* Social Links - Priority display */}
            <div className="flex flex-wrap items-center gap-2">
                {profile?.social_twitter && (
                    <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-blue-400 hover:bg-blue-50 transition-all"><Twitter size={16} /></a>
                )}
                {profile?.social_github && (
                    <a href={profile.social_github} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-white hover:bg-black transition-all"><Github size={16} /></a>
                )}
                {profile?.social_linkedin && (
                    <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-blue-700 hover:bg-blue-50 transition-all"><Linkedin size={16} /></a>
                )}
                {profile?.social_whatsapp && (
                    <a href={profile.social_whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-green-500 hover:bg-green-50 transition-all"><MessageCircle size={16} /></a>
                )}
                {profile?.social_instagram && (
                    <a href={profile.social_instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-pink-600 hover:bg-pink-50 transition-all"><Instagram size={16} /></a>
                )}
                {profile?.social_youtube && (
                    <a href={profile.social_youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-all"><Youtube size={16} /></a>
                )}
                <a href={profile?.website_url || '#'} className="ml-auto flex items-center gap-1.5 p-2 px-3 bg-[#0A66C2]/5 text-[#0A66C2] rounded-lg text-[11px] font-bold hover:bg-[#0A66C2]/10 transition-all">
                    <LinkIcon size={14} />
                    <span>Site web</span>
                </a>
            </div>

            {/* Core Contact Info */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-[12px] text-neutral-600 dark:text-neutral-400 font-medium group cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 group-hover:bg-[#0A66C2]/10 group-hover:text-[#0A66C2] transition-all">
                        <Mail size={14} />
                    </div>
                    <span className="truncate">{user.email}</span>
                </div>

                <div className="flex items-center gap-3 text-[12px] text-neutral-600 dark:text-neutral-400 font-medium">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <CircleDot size={14} className="text-[#0A66C2]" />
                    </div>
                    <span>Membre WorkNet</span>
                </div>

                <div className="flex items-center gap-3 text-[12px] text-neutral-600 dark:text-neutral-400 font-medium">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <Calendar size={14} />
                    </div>
                    <span>Inscrit le {user.created_at ? new Date(user.created_at).toLocaleDateString() : '14/02/2026'}</span>
                </div>
            </div>
        </div>
    );
};
