'use client';

import { Plus, Briefcase, Edit3, Trash2 } from 'lucide-react';
import { Experience } from '@/src/features/experiences/services/experience-types';

interface ExperiencesSectionProps {
    experiences: Experience[];
    isLoading: boolean;
    onAdd: () => void;
    onEdit: (exp: Experience) => void;
    onDelete: (id: string) => void;
}

export const ExperiencesSection = ({
    experiences,
    isLoading,
    onAdd,
    onEdit,
    onDelete
}: ExperiencesSectionProps) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Expériences professionnelles
                </h2>

                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-[11px] font-bold hover:opacity-90 transition-all active:scale-95"
                >
                    <Plus size={12} /> Ajouter
                </button>
            </div>

            {experiences.length > 0 ? (
                <div className="space-y-3">
                    {experiences.map((exp) => (
                        <div
                            key={exp.id}
                            className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                        >
                            <div className="flex gap-3 items-center flex-1 min-w-0">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-shrink-0">
                                    <Briefcase size={16} className="text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                        {exp.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 truncate">
                                        {exp.company_name} • {new Date(exp.start_date).getFullYear()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onEdit(exp)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(exp.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Briefcase size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-xs text-gray-400 mb-2">Aucune expérience</p>
                    <button
                        type="button"
                        onClick={onAdd}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Ajouter votre première expérience
                    </button>
                </div>
            )}
        </div>
    );
};
