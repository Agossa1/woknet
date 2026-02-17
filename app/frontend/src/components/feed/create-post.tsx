'use client';

import { Image, Calendar, Newspaper, Video } from "lucide-react";

interface CreatePostProps {
    userAvatar?: string;
    onClick: () => void;
}

export default function CreatePost({ userAvatar, onClick }: CreatePostProps) {
    const iconStroke = 1.5;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-neutral-100 dark:border-gray-800 p-3 shadow-sm mb-4">
            <div className="flex gap-3 mb-4 items-center">
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                    <img
                        src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=You"}
                        className="w-full h-full object-cover"
                        alt="User"
                    />
                </div>
                <button
                    onClick={onClick}
                    className="flex-1 text-left bg-neutral-50 dark:bg-gray-800 rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-700 transition-all border border-neutral-100 dark:border-gray-700 font-inter"
                >
                    Commencer une publication...
                </button>
            </div>

            <div className="flex justify-between items-center px-1">
                <button
                    onClick={onClick}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded hover:bg-neutral-50 dark:hover:bg-gray-800 transition-colors group"
                >
                    <Video size={18} strokeWidth={iconStroke} className="text-green-600" />
                    <span className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Vidéo</span>
                </button>

                <button
                    onClick={onClick}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded hover:bg-neutral-50 dark:hover:bg-gray-800 transition-colors group"
                >
                    <Image size={18} strokeWidth={iconStroke} className="text-blue-500" />
                    <span className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Média</span>
                </button>

                <button
                    onClick={onClick}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded hover:bg-neutral-50 dark:hover:bg-gray-800 transition-colors group"
                >
                    <Calendar size={18} strokeWidth={iconStroke} className="text-[#C37D16]" />
                    <span className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Événement</span>
                </button>

                <button
                    onClick={onClick}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded hover:bg-neutral-50 dark:hover:bg-gray-800 transition-colors group"
                >
                    <Newspaper size={18} strokeWidth={iconStroke} className="text-[#E06847]" />
                    <span className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Article</span>
                </button>
            </div>
        </div>
    );
}
