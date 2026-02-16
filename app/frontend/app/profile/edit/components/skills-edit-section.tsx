'use client';

import { Plus, X } from 'lucide-react';
import { ProfileSkill } from '@/src/features/skills/services/skills-types';

interface SkillsEditSectionProps {
    skills: ProfileSkill[];
    isLoading: boolean;
    onAdd: () => void;
    onRemove: (skillId: string) => void;
}

export const SkillsEditSection = ({
    skills,
    isLoading,
    onAdd,
    onRemove
}: SkillsEditSectionProps) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Compétences
                </h2>

                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-[11px] font-bold hover:opacity-90 transition-all active:scale-95"
                >
                    <Plus size={12} /> Ajouter
                </button>
            </div>

            {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <div
                            key={skill.skill_id}
                            className="group inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                        >
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {skill.skill_name}
                            </span>
                            {skill.endorsements_count > 0 && (
                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-[10px] font-black text-gray-600 dark:text-gray-400">
                                    +{skill.endorsements_count}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => onRemove(skill.skill_id)}
                                className="p-0.5 text-gray-400 hover:text-red-600 rounded transition-all opacity-0 group-hover:opacity-100"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <p className="text-sm text-gray-400 mb-2">Aucune compétence ajoutée</p>
                    <button
                        type="button"
                        onClick={onAdd}
                        className="text-xs font-bold text-gray-900 dark:text-white hover:underline"
                    >
                        Ajouter une compétence
                    </button>
                </div>
            )}
        </div>
    );
};
