'use client';

import { Briefcase, ExternalLink, Bookmark } from "lucide-react";

interface JobCardProps {
    job: {
        title: string;
        company: string;
        location: string;
        salary?: string;
        logo: string;
    };
}

export default function JobCard({ job }: JobCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm mb-4 group hover:border-blue-500/30 transition-colors">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                    Offre recommandée
                </span>
                <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors"><Bookmark size={16} /></button>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors"><Briefcase size={16} /></button>
                </div>
            </div>
            <div className="p-5 flex gap-5 items-start">
                <div className="relative">
                    <img
                        src={job.logo}
                        className="w-14 h-14 rounded-xl bg-white border border-gray-100 dark:border-gray-800 shadow-sm p-1"
                        alt={job.company}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight hover:text-blue-600 cursor-pointer">{job.title}</h4>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{job.company}</p>
                    <p className="text-xs text-gray-400 font-medium">{job.location} {job.salary && `• ${job.salary}`}</p>

                    <div className="mt-4 flex gap-3">
                        <button className="flex-1 sm:flex-none px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition shadow-lg shadow-black/5">
                            Postuler
                        </button>
                        <button className="flex items-center justify-center p-2 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
