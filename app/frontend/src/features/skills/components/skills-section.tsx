import { useState, useRef, useEffect } from "react";
import { Plus, X, Search, Loader2, Sparkles, Trophy } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addSkillThunk, removeSkillThunk, searchSkillsThunk } from "../services/skills-thunks";
import { selectProfileSkills, selectSkillSearchResults, selectSkillsLoading } from "../services/skills-selectors";
import { clearSearchResults } from "../services/skills-slice";
import { SkillLevel } from "../services/skills-types";

// Helper to determine chip colors based on level (optional enhancement)
const getLevelColor = (level: SkillLevel) => {
    switch (level) {
        case SkillLevel.EXPERT: return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
        case SkillLevel.ADVANCED: return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
        case SkillLevel.INTERMEDIATE: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
        default: return "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
};

interface SkillsProps {
    profileId: string;
    isCurrentUser?: boolean; // To allow/disallow editing
}

export const SkillsSection = ({ profileId, isCurrentUser = false }: SkillsProps) => {
    const dispatch = useAppDispatch();
    const skills = useAppSelector(selectProfileSkills);
    const searchResults = useAppSelector(selectSkillSearchResults);
    const isLoading = useAppSelector(selectSkillsLoading);

    const [isAdding, setIsAdding] = useState(false);
    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter results to exclude already added skills
    const filteredResults = searchResults.filter(
        res => !skills.some(s => s.skill_name?.toLowerCase() === res.name.toLowerCase())
    );

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 1) {
                dispatch(searchSkillsThunk(query));
            } else {
                dispatch(clearSearchResults());
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, dispatch]);

    // Focus input when adding
    useEffect(() => {
        if (isAdding) {
            inputRef.current?.focus();
        } else {
            setQuery("");
            dispatch(clearSearchResults());
        }
    }, [isAdding, dispatch]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsAdding(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddSkill = async (skillName: string) => {
        if (!skillName.trim()) return;

        // Optimistic add logic handled by thunk/slice, just dispatch
        const result = await dispatch(addSkillThunk({
            profileId,
            skillName: skillName.trim(),
            level: SkillLevel.INTERMEDIATE // Default level
        }));

        if (addSkillThunk.fulfilled.match(result)) {
            setQuery("");
            setIsAdding(false);
        }
    };

    const handleRemoveSkill = (skillId: string) => {
        if (confirm("Êtes-vous sûr de vouloir retirer cette compétence ?")) {
            dispatch(removeSkillThunk({ profileId, skillId }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0 && filteredResults[highlightedIndex]) {
                handleAddSkill(filteredResults[highlightedIndex].name);
            } else if (query.trim()) {
                handleAddSkill(query); // Allow adding custom skill
            }
        } else if (e.key === "Escape") {
            setIsAdding(false);
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-yellow-500" />
                    Expertises & Compétences
                </h2>
                {isCurrentUser && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
                        title="Ajouter une compétence"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            {/* List of Skills */}
            <div className="flex flex-wrap gap-2.5">
                {skills.length > 0 ? (
                    skills.map((skill) => (
                        <div
                            key={skill.skill_id}
                            className={`group relative px-4 py-2 border rounded-xl flex items-center gap-2 transition-all cursor-default shadow-sm hover:shadow-md ${getLevelColor(skill.level)}`}
                        >
                            <span className="text-xs font-bold">{skill.skill_name}</span>

                            {/* Endorsements Badge (Mini) */}
                            {skill.endorsements_count > 0 && (
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/50 rounded-full text-[10px] font-black">
                                    <Trophy size={10} className="text-yellow-600" />
                                    <span>{skill.endorsements_count}</span>
                                </div>
                            )}

                            {/* Remove Button (Hover only) */}
                            {isCurrentUser && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveSkill(skill.skill_id); }}
                                    className="ml-1 p-0.5 text-current opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-opacity"
                                    title="Retirer"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <p className="text-sm text-gray-400 italic">Aucune compétence ajoutée.</p>
                    )
                )}

                {/* Add Input Area */}
                {isCurrentUser && isAdding && (
                    <div className="relative w-full max-w-xs" ref={dropdownRef}>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-xl shadow-lg ring-4 ring-blue-500/10 transition-all">
                            <Search size={14} className="text-blue-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Rechercher une compétence..." // e.g. React, UX Design
                                className="bg-transparent border-none outline-none text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 w-full"
                            />
                            {isLoading ? (
                                <Loader2 size={14} className="animate-spin text-blue-500" />
                            ) : (
                                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Autocomplete Dropdown */}
                        {(query.length > 1 || filteredResults.length > 0) && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto">
                                {filteredResults.length > 0 ? (
                                    filteredResults.map((result, index) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleAddSkill(result.name)}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors
                                                ${index === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}
                                            `}
                                        >
                                            <span>{result.name}</span>
                                            {result.category && <span className="text-[10px] text-gray-400 uppercase">{result.category}</span>}
                                        </button>
                                    ))
                                ) : (
                                    query.length > 1 && !isLoading && (
                                        <button
                                            onClick={() => handleAddSkill(query)}
                                            className="w-full text-left px-4 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Créer "{query}"
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
