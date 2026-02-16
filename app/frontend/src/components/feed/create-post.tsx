'use client';

import { Image, Calendar, Newspaper } from "lucide-react";

interface CreatePostProps {
    userAvatar?: string;
    onClick: () => void;
}

export default function CreatePost({ userAvatar, onClick }: CreatePostProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm mb-4">
            <div className="flex gap-3 mb-3">
                <img
                    src={userAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=You"}
                    className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                    alt="User Avatar"
                />
                <button
                    onClick={onClick}
                    className="flex-1 text-left bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    Quoi de neuf ?
                </button>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex gap-2">
                    <button
                        onClick={onClick}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition flex items-center gap-2 group"
                    >
                        <Image size={20} className="text-blue-500" />
                        <span className="text-xs font-semibold hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Média</span>
                    </button>
                    <button
                        onClick={onClick}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition flex items-center gap-2 group"
                    >
                        <Calendar size={20} className="text-orange-500" />
                        <span className="text-xs font-semibold hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Événement</span>
                    </button>
                    <button
                        onClick={onClick}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition flex items-center gap-2 group"
                    >
                        <Newspaper size={20} className="text-red-500" />
                        <span className="text-xs font-semibold hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Article</span>
                    </button>
                </div>
                <button
                    onClick={onClick}
                    className="px-6 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-full hover:opacity-90 transition shadow-lg shadow-black/5"
                >
                    Publier
                </button>
            </div>
        </div>
    );
}
