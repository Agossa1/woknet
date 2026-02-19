'use client';

import { Plus } from "lucide-react";
import { Education, DEGREE_LABELS } from "@/src/features/educations/services/education-types";

interface ProfileEducationProps {
    educations: Education[];
    isOwnProfile?: boolean;
    onAdd?: () => void;
}

import { GraduationCap } from "lucide-react";

export const ProfileEducation = ({ educations, isOwnProfile, onAdd }: ProfileEducationProps) => {
    return (
        <div className="space-y-0">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter">Formation</h2>
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
                {educations.length > 0 ? (
                    educations.map((edu, index) => (
                        <div key={edu.id || index} className="p-4 md:p-6 flex gap-3 md:gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center shrink-0">
                                <GraduationCap size={22} className="text-neutral-400" />
                            </div>
                            <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                    <h3 className="text-[14px] md:text-[15px] font-semibold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors truncate font-inter">
                                        {DEGREE_LABELS[edu.degree] || edu.degree}
                                    </h3>
                                    <span className="text-[11px] md:text-[12px] text-neutral-500 font-medium whitespace-nowrap">
                                        {new Date(edu.start_date).getFullYear()} — {edu.is_current ? 'En cours' : edu.end_date ? new Date(edu.end_date).getFullYear() : '?'}
                                    </span>
                                </div>
                                <p className="text-[13px] md:text-[14px] text-neutral-700 dark:text-neutral-300 font-medium">{edu.school_name}</p>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] md:text-[12px] text-neutral-500">
                                    {edu.field_of_study && <span className="italic">{edu.field_of_study}</span>}
                                    {edu.location && (
                                        <>
                                            <span className="hidden md:inline w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                            <span>{edu.location}</span>
                                        </>
                                    )}
                                </div>
                                {edu.description && (
                                    <p className="mt-2 text-[12px] md:text-[13.5px] text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 p-6 text-center">
                        <p className="text-sm text-neutral-400 italic">Aucune formation ajoutée pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
