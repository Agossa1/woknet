'use client';

import { UserPlus } from "lucide-react";
import Link from "next/link";

interface SuggestionProfile {
    id: string;
    name: string;
    role: string;
    company?: string;
    avatar: string;
}

interface SuggestionCardProps {
    profiles: SuggestionProfile[];
}

export default function SuggestionCard({ profiles }: SuggestionCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm overflow-hidden mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Personnes que vous pourriez connaître</h3>
                <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Voir tout</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {profiles.map((profile, idx) => (
                    <div key={idx} className="min-w-[160px] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center relative group bg-gray-50/50 dark:bg-gray-800/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                        <button className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all">
                            <UserPlus size={16} />
                        </button>
                        <Link href={`/profile/${profile.id}`} className="hover:opacity-90 transition-opacity mb-3">
                            <img
                                src={profile.avatar}
                                className="w-20 h-20 rounded-full bg-gray-50 border-2 border-white dark:border-gray-900 shadow-md"
                                alt={profile.name}
                            />
                        </Link>
                        <Link href={`/profile/${profile.id}`} className="hover:underline decoration-blue-500 underline-offset-2 transition-all w-full">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{profile.name}</h4>
                        </Link>
                        <p className="text-[10px] font-medium text-gray-400 truncate w-full mb-4 leading-tight">
                            {profile.role} {profile.company && `@ ${profile.company}`}
                        </p>
                        <button className="w-full py-2 text-[10px] font-black uppercase tracking-widest border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                            Se connecter
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
