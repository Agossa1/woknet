'use client';

import {
    Mail, CircleDot, Twitter, Github, Linkedin, Instagram, Facebook, Youtube,
    MessageCircle, Send, Ghost, Gamepad2, Twitch, MessageSquare, Globe,
    MapPin, Link as LinkIcon, Calendar
} from "lucide-react";
import { User } from "@/src/features/auth/services/authTypes";
import { ProfileData as Profile } from "@/src/features/profiles/services/profile-types";

interface ProfileContactBarProps {
    user: User;
    profile: Profile | null;
}

export const ProfileContactBar = ({ user, profile }: ProfileContactBarProps) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 text-sm text-gray-400 dark:text-gray-500 font-medium">
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <Mail size={14} className="opacity-50 shrink-0" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{user.email}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex items-center gap-1.5 text-[11px] font-bold whitespace-nowrap">
                    <CircleDot size={14} className="opacity-50 text-blue-500" />
                    <span>Membre WorkNet</span>
                </div>
                <div className="flex justify-center gap-4 md:ml-auto pt-2 md:pt-0">
                    {profile?.social_twitter && (
                        <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Twitter size={18} /></a>
                    )}
                    {profile?.social_github && (
                        <a href={profile.social_github} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition"><Github size={18} /></a>
                    )}
                    {profile?.social_linkedin && (
                        <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Linkedin size={18} /></a>
                    )}
                    {profile?.social_instagram && (
                        <a href={profile.social_instagram} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition"><Instagram size={18} /></a>
                    )}
                    {profile?.social_facebook && (
                        <a href={profile.social_facebook} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Facebook size={18} /></a>
                    )}
                    {profile?.social_youtube && (
                        <a href={profile.social_youtube} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"><Youtube size={18} /></a>
                    )}
                    {profile?.social_whatsapp && (
                        <a href={profile.social_whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition"><MessageCircle size={18} /></a>
                    )}
                    {profile?.social_telegram && (
                        <a href={profile.social_telegram} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"><Send size={18} /></a>
                    )}
                    {profile?.social_snapchat && (
                        <a href={profile.social_snapchat} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition"><Ghost size={18} /></a>
                    )}
                    {profile?.social_discord && (
                        <a href={profile.social_discord} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition"><Gamepad2 size={18} /></a>
                    )}
                    {profile?.social_twitch && (
                        <a href={profile.social_twitch} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition"><Twitch size={18} /></a>
                    )}
                    {profile?.social_reddit && (
                        <a href={profile.social_reddit} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition"><MessageSquare size={18} /></a>
                    )}
                    {profile?.social_other && (
                        <a href={profile.social_other} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition"><Globe size={18} /></a>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <span className="flex items-center gap-1.5"><MapPin size={17} className="text-gray-400" /> {profile?.location_name || 'France'}</span>
                <a href={profile?.website_url || '#'} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><LinkIcon size={16} />{profile?.website_url || 'Site web'}</a>
                <span className="flex items-center gap-1.5"><Calendar size={17} className="text-gray-400" /> Inscrit le {user.created_at ? new Date(user.created_at).toLocaleDateString() : '14/02/2026'}</span>
            </div>
        </div>
    );
};
