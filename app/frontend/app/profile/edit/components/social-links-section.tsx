'use client';

import { useState } from 'react';
import { Plus, X, ChevronDown, Globe, Github, Twitter, Linkedin, Instagram, Facebook, Youtube, MessageCircle, Send, Ghost, Gamepad2, Twitch, MessageSquare, Music } from 'lucide-react';

const SOCIAL_PLATFORMS = [
    { id: 'social_linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { id: 'social_github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { id: 'social_twitter', label: 'Twitter (X)', icon: Twitter, placeholder: 'https://x.com/username' },
    { id: 'social_instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
    { id: 'social_facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
    { id: 'social_youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@username' },
    { id: 'social_tiktok', label: 'TikTok', icon: Music, placeholder: 'https://tiktok.com/@username' },
    { id: 'social_reddit', label: 'Reddit', icon: MessageSquare, placeholder: 'https://reddit.com/user/username' },
    { id: 'social_whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/number' },
    { id: 'social_telegram', label: 'Telegram', icon: Send, placeholder: 'https://t.me/username' },
    { id: 'social_discord', label: 'Discord', icon: Gamepad2, placeholder: 'username#0000' },
    { id: 'social_twitch', label: 'Twitch', icon: Twitch, placeholder: 'https://twitch.tv/username' },
    { id: 'social_snapchat', label: 'Snapchat', icon: Ghost, placeholder: 'username' },
    { id: 'social_other', label: 'Autre', icon: Globe, placeholder: 'https://...' },
];

interface SocialLinksSectionProps {
    formData: Record<string, string>;
    visibleSocials: string[];
    onAddSocial: (id: string) => void;
    onRemoveSocial: (id: string) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SocialLinksSection = ({
    formData,
    visibleSocials,
    onAddSocial,
    onRemoveSocial,
    onChange
}: SocialLinksSectionProps) => {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Réseaux Sociaux
                </h2>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                        <Plus size={12} /> Ajouter
                        <ChevronDown size={12} className={`transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSelectorOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1.5 z-50 max-h-64 overflow-y-auto">
                                {SOCIAL_PLATFORMS
                                    .filter(p => !visibleSocials.includes(p.id))
                                    .map(platform => (
                                        <button
                                            key={platform.id}
                                            type="button"
                                            onClick={() => {
                                                onAddSocial(platform.id);
                                                setIsSelectorOpen(false);
                                            }}
                                            className="flex items-center gap-2 w-full px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all text-left"
                                        >
                                            <platform.icon size={14} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {platform.label}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {visibleSocials.length > 0 ? (
                <div className="space-y-3">
                    {visibleSocials.map(fieldId => {
                        const platform = SOCIAL_PLATFORMS.find(p => p.id === fieldId);
                        if (!platform) return null;

                        return (
                            <div key={fieldId} className="group relative">
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                                    <platform.icon size={12} className="text-gray-500 dark:text-gray-400" />
                                    {platform.label}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name={fieldId}
                                        value={formData[fieldId] || ''}
                                        onChange={onChange}
                                        className="w-full px-3 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                        placeholder={platform.placeholder}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onRemoveSocial(fieldId)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-xs text-gray-400">Aucun réseau social ajouté</p>
                </div>
            )}
        </div>
    );
};
