import { useState, useEffect } from "react";
import { Plus, X, Loader2, Globe } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectLanguages, selectLanguagesLoading } from "../services/language-slices";
import { addLanguageThunk, deleteLanguageThunk, getProfileLanguagesThunk } from "../services/language-thunks";
import { LanguageProficiency } from "../services/language-types";

interface LanguagesSectionProps {
    profileId: string;
    isCurrentUser?: boolean;
}

const PROFICIENCY_LEVELS: { label: string; value: LanguageProficiency }[] = [
    { label: "Débutant", value: "BEGINNER" },
    { label: "Intermédiaire", value: "INTERMEDIATE" },
    { label: "Avancé", value: "ADVANCED" },
    { label: "Courant", value: "FLUENT" },
    { label: "Natif / Maternel", value: "NATIVE" },
];

export const LanguagesSection = ({ profileId, isCurrentUser = false }: LanguagesSectionProps) => {
    const dispatch = useAppDispatch();
    const languages = useAppSelector(selectLanguages);
    const isLoading = useAppSelector(selectLanguagesLoading);

    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [proficiency, setProficiency] = useState<LanguageProficiency>("INTERMEDIATE");

    useEffect(() => {
        if (profileId) {
            dispatch(getProfileLanguagesThunk(profileId));
        }
    }, [profileId, dispatch]);

    const handleAdd = async () => {
        if (!name.trim()) return;
        const result = await dispatch(addLanguageThunk({ profile_id: profileId, name: name.trim(), proficiency }));
        if (addLanguageThunk.fulfilled.match(result)) {
            setName("");
            setProficiency("INTERMEDIATE");
            setIsAdding(false);
        }
    };

    const handleRemove = (id: string) => {
        dispatch(deleteLanguageThunk(id));
    };

    return (
        <div className="space-y-0">
            <div className="p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white">Langues</h2>
                {isCurrentUser && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1.5 text-[#0A66C2] hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 rounded transition-colors text-[13px] md:text-[14px] font-semibold"
                    >
                        <Plus size={18} /> <span>Ajouter</span>
                    </button>
                )}
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {languages.length > 0 ? (
                    languages.map((lang) => (
                        <div key={lang.id} className="p-4 md:p-6 flex items-center gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center shrink-0">
                                <Globe size={22} className="text-neutral-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-[14px] md:text-[15px] font-bold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors truncate">
                                    {lang.name}
                                </h3>
                                <p className="text-[12px] md:text-[13px] text-neutral-500 font-medium">
                                    {PROFICIENCY_LEVELS.find(p => p.value === lang.proficiency)?.label}
                                </p>
                            </div>
                            {isCurrentUser && (
                                <button
                                    onClick={() => handleRemove(lang.id)}
                                    className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <div className="py-12 p-6 text-center text-sm text-neutral-400 italic">
                            Aucune langue renseignée.
                        </div>
                    )
                )}

                {isAdding && (
                    <div className="p-4 md:p-6 bg-neutral-50/50 dark:bg-neutral-800/20 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400">Langue</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ex: anglais, japonais..."
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400">Niveau de maîtrise</label>
                                <select
                                    value={proficiency}
                                    onChange={(e) => setProficiency(e.target.value as LanguageProficiency)}
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors cursor-pointer"
                                >
                                    {PROFICIENCY_LEVELS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label.toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!name.trim() || isLoading}
                                className="px-5 py-2 bg-[#0A66C2] text-white text-sm font-semibold rounded hover:bg-[#004182] disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
