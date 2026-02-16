'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectProfileSkills } from '@/src/features/skills/services/skills-selectors';
import { addSkillThunk, searchSkillsThunk } from '@/src/features/skills/services/skills-thunks';
import { SkillLevel } from '@/src/features/skills/services/skills-types';
import { X, Plus, Loader2 } from 'lucide-react';

interface SkillSearchModalProps {
    profileId: string;
    onClose: () => void;
}

export const SkillSearchModal = ({ profileId, onClose }: SkillSearchModalProps) => {
    const dispatch = useAppDispatch();
    const existingSkills = useAppSelector(selectProfileSkills);

    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleSearch = async (searchQuery: string) => {
        setQuery(searchQuery);
        if (searchQuery.trim().length > 1) {
            setIsSearching(true);
            const result = await dispatch(searchSkillsThunk(searchQuery));
            if (searchSkillsThunk.fulfilled.match(result)) {
                setSearchResults(result.payload);
            }
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    const handleAddSkill = async (skillName: string) => {
        setIsAdding(true);
        const result = await dispatch(addSkillThunk({
            profileId,
            skillName,
            level: SkillLevel.INTERMEDIATE
        }));
        setIsAdding(false);

        if (addSkillThunk.fulfilled.match(result)) {
            onClose();
        }
    };

    const filteredResults = searchResults.filter(
        result => !existingSkills.some(s => s.skill_name?.toLowerCase() === result.name.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">Ajouter une compétence</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Rechercher (React, Python, UX...)"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                            autoFocus
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 size={16} className="animate-spin text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    {query.length > 1 ? (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((result) => (
                                    <button
                                        key={result.id}
                                        type="button"
                                        onClick={() => handleAddSkill(result.name)}
                                        disabled={isAdding}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group disabled:opacity-50"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {result.name}
                                            </p>
                                            {result.category && (
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                                                    {result.category}
                                                </p>
                                            )}
                                        </div>
                                        <Plus size={16} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-400 mb-3">Aucun résultat</p>
                                    {query.trim() && (
                                        <button
                                            type="button"
                                            onClick={() => handleAddSkill(query.trim())}
                                            disabled={isAdding}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isAdding ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Plus size={14} />
                                            )}
                                            Créer "{query.trim()}"
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-sm text-gray-400">
                            Tapez au moins 2 caractères...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
