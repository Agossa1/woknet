'use client';

import { Plus } from "lucide-react";
import { Experience, JOB_TYPE_LABELS, PLACE_TYPE_LABELS } from "@/src/features/experiences/services/experience-types";

interface ProfileExperienceProps {
    experiences: Experience[];
}

export const ProfileExperience = ({ experiences }: ProfileExperienceProps) => {
    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Parcours professionnel</h2>
                <button className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-1.5 rounded-full font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Plus size={14} /> Ajouter
                </button>
            </div>

            <div className="space-y-10 border-l-2 border-gray-100 dark:border-gray-800 ml-1 pl-6 md:pl-8 relative">
                {experiences.length > 0 ? (
                    experiences.map((exp, index) => (
                        <div key={exp.id || index} className="relative group">
                            <div className={`absolute -left-[27px] md:-left-[37px] top-1.5 h-4 w-4 rounded-full border-4 border-white dark:border-gray-900 shadow-sm ${exp.is_current ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{exp.title}</h3>
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full w-fit mt-2 sm:mt-0">
                                    {new Date(exp.start_date).getFullYear()} — {exp.is_current ? 'Présent' : exp.end_date ? new Date(exp.end_date).getFullYear() : '?'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                                <p className="text-gray-400 font-bold tracking-tight">{exp.company_name}</p>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                <p className="text-gray-400 font-medium text-sm">{exp.city ? `${exp.city}, ${exp.country}` : exp.location || 'France'}</p>
                                {(exp.type_job || exp.type_place) && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                        <div className="flex gap-2">
                                            {exp.type_job && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md uppercase tracking-wide">{JOB_TYPE_LABELS[exp.type_job] || exp.type_job}</span>}
                                            {exp.type_place && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md uppercase tracking-wide">{PLACE_TYPE_LABELS[exp.type_place] || exp.type_place}</span>}
                                        </div>
                                    </>
                                )}
                            </div>
                            {exp.description && (
                                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                    {exp.description}
                                </p>
                            )}
                            {exp.stack && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {exp.stack.split(',').map(tag => (
                                        <span key={tag.trim()} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase tracking-wider rounded-md text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">{tag.trim()}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                        <p className="text-sm text-gray-400 font-medium">Aucune expérience ajoutée pour le moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
};
