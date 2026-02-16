'use client';

import { MoreHorizontal, ExternalLink } from "lucide-react";

interface SponsoredCardProps {
    brand: {
        name: string;
        logo: string;
    };
    content: string;
    image?: string;
}

export default function SponsoredCard({ brand, content, image }: SponsoredCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm mb-4">
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src={brand.logo}
                        className="w-10 h-10 rounded-lg bg-gray-100 object-cover border border-gray-100 dark:border-gray-800"
                        alt={brand.name}
                    />
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{brand.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sponsorisé</span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="px-4 pb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
            </div>

            {image && (
                <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 relative group overflow-hidden">
                    <img
                        src={image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt="Sponsored"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Publicité</span>
                    </div>
                </div>
            )}

            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Découvrez notre solution</span>
                <button className="flex items-center gap-2 px-5 py-2 border border-blue-600/50 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <span>En savoir plus</span>
                    <ExternalLink size={12} />
                </button>
            </div>
        </div>
    );
}
