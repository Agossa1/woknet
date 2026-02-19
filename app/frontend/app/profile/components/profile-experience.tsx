'use client';

import { Plus } from "lucide-react";
import { Experience, JOB_TYPE_LABELS, PLACE_TYPE_LABELS } from "@/src/features/experiences/services/experience-types";

interface ProfileExperienceProps {
    experiences: Experience[];
    isOwnProfile?: boolean;
    onAdd?: () => void;
}

import { Briefcase } from "lucide-react";

export const ProfileExperience = ({ experiences, isOwnProfile, onAdd }: ProfileExperienceProps) => {
    return (
        <div className="space-y-0">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter">Expérience</h2>
                {isOwnProfile && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-1.5 text-[#0A66C2] hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 rounded transition-colors text-[13px] md:text-[14px] font-semibold whitespace-nowrap"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Ajouter</span>
                    </button>
                )}
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {experiences.length > 0 ? (
                    experiences.map((exp, index) => (
                        <div key={exp.id || index} className="p-4 md:p-6 flex gap-3 md:gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center shrink-0">
                                <Briefcase size={22} className="text-neutral-400" />
                            </div>
                            <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                    <h3 className="text-[14px] md:text-[15px] font-semibold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors truncate font-inter">{exp.title}</h3>
                                    <span className="text-[11px] md:text-[12px] text-neutral-500 font-medium whitespace-nowrap">
                                        {new Date(exp.start_date).getFullYear()} — {exp.is_current ? 'Présent' : exp.end_date ? new Date(exp.end_date).getFullYear() : '?'}
                                    </span>
                                </div>
                                <p className="text-[13px] md:text-[14px] text-neutral-700 dark:text-neutral-300 font-medium">{exp.company_name}</p>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-[12px] text-neutral-500">
                                    <span>{exp.city ? `${exp.city}, ${exp.country}` : exp.location || 'France'}</span>
                                    {(exp.type_job || exp.type_place) && (
                                        <>
                                            <span className="hidden md:inline w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                            <div className="flex gap-2">
                                                {exp.type_job && <span>{JOB_TYPE_LABELS[exp.type_job] || exp.type_job}</span>}
                                                {exp.type_place && <span className="italic">({PLACE_TYPE_LABELS[exp.type_place] || exp.type_place})</span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {exp.description && (
                                    <p className="mt-2 text-[12px] md:text-[13.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">
                                        {exp.description}
                                    </p>
                                )}
                                {exp.stack && (
                                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-50 dark:border-neutral-800/50">
                                        {exp.stack.split(',').map(tag => (
                                            <span key={tag.trim()} className="px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800/50 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 border border-neutral-100 dark:border-neutral-800 rounded-full">{tag.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 p-6 text-center">
                        <p className="text-sm text-neutral-400 italic">Aucune expérience ajoutée pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
