import { useState, useRef, useEffect } from "react";
import { Plus, X, Search, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addSkillThunk, removeSkillThunk, searchSkillsThunk } from "../services/skills-thunks";
import { selectProfileSkills, selectSkillSearchResults, selectSkillsLoading } from "../services/skills-selectors";
import { clearSearchResults } from "../services/skills-slice";
import { SkillLevel } from "../services/skills-types";

// Helper to determine chip colors based on level
const getLevelColor = (level: SkillLevel) => {
    switch (level) {
        case SkillLevel.EXPERT: return "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black";
        case SkillLevel.ADVANCED: return "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700";
        default: return "bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border-neutral-100 dark:border-neutral-800";
    }
};

interface SkillsProps {
    profileId: string;
    isCurrentUser?: boolean;
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

    const filteredResults = searchResults.filter(
        res => !skills.some(s => s.skill_name?.toLowerCase() === res.name.toLowerCase())
    );

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

    useEffect(() => {
        if (isAdding) {
            inputRef.current?.focus();
        } else {
            setQuery("");
            dispatch(clearSearchResults());
        }
    }, [isAdding, dispatch]);

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
        const result = await dispatch(addSkillThunk({ profileId, skillName: skillName.trim(), level: SkillLevel.INTERMEDIATE }));
        if (addSkillThunk.fulfilled.match(result)) {
            setQuery("");
            setIsAdding(false);
        }
    };

    const handleRemoveSkill = (skillId: string) => {
        if (confirm("Retirer cette compétence ?")) {
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
                handleAddSkill(query);
            }
        } else if (e.key === "Escape") {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-4 font-inter">
            <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-neutral-400 italic">Compétences</h2>
                {isCurrentUser && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-1 text-neutral-400 hover:text-[#0A66C2] rounded transition-colors"
                        title="Ajouter"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                    skills.map((skill) => (
                        <div
                            key={skill.skill_id}
                            className={`group relative px-3 py-1 border rounded-full flex items-center gap-2 transition-all cursor-default ${getLevelColor(skill.level)}`}
                        >
                            <span className="text-[12px] font-medium">{skill.skill_name}</span>

                            {isCurrentUser && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveSkill(skill.skill_id); }}
                                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <p className="text-[11px] text-neutral-400 italic">Non renseigné</p>
                    )
                )}

                {isCurrentUser && isAdding && (
                    <div className="relative w-full" ref={dropdownRef}>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-800 border-2 border-[#0A66C2] rounded-lg shadow-sm">
                            <Search size={14} className="text-[#0A66C2]" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Rechercher..."
                                className="bg-transparent border-none outline-none text-[12px] font-medium text-neutral-900 dark:text-white placeholder-neutral-400 w-full"
                            />
                            {isLoading ? (
                                <Loader2 size={14} className="animate-spin text-[#0A66C2]" />
                            ) : (
                                <button onClick={() => setIsAdding(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {(query.length > 1 || filteredResults.length > 0) && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                                {filteredResults.length > 0 ? (
                                    filteredResults.map((result, index) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleAddSkill(result.name)}
                                            className={`w-full text-left px-4 py-2 text-[12px] font-medium flex items-center justify-between transition-colors
                                                ${index === highlightedIndex ? 'bg-neutral-50 dark:bg-neutral-800 text-[#0A66C2]' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'}
                                            `}
                                        >
                                            <span>{result.name}</span>
                                        </button>
                                    ))
                                ) : (
                                    query.length > 1 && !isLoading && (
                                        <button
                                            onClick={() => handleAddSkill(query)}
                                            className="w-full text-left px-4 py-2 text-[12px] font-medium text-[#0A66C2] hover:bg-neutral-50 transition-colors flex items-center gap-2"
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
        </div>
    );
};
