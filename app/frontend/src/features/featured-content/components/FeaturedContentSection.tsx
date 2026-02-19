import { useState, useEffect } from "react";
import { Plus, X, Loader2, Pin, ExternalLink, Layout, Type } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectFeaturedItems, selectFeaturedLoading } from "../services/featured-slices";
import { addFeaturedThunk, deleteFeaturedThunk, getProfileFeaturedThunk } from "../services/featured-thunks";
import { FeaturedType } from "../services/featured-types";

interface FeaturedContentSectionProps {
    profileId: string;
    isCurrentUser?: boolean;
}

export const FeaturedContentSection = ({ profileId, isCurrentUser = false }: FeaturedContentSectionProps) => {
    const dispatch = useAppDispatch();
    const featuredItems = useAppSelector(selectFeaturedItems);
    const isLoading = useAppSelector(selectFeaturedLoading);

    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (profileId) {
            dispatch(getProfileFeaturedThunk(profileId));
        }
    }, [profileId, dispatch]);

    const handleAdd = async () => {
        if (!title.trim() || !url.trim()) return;
        const result = await dispatch(addFeaturedThunk({
            profile_id: profileId,
            type: 'EXTERNAL_LINK',
            title: title.trim(),
            description: description.trim() || null,
            external_url: url.trim()
        }));
        if (addFeaturedThunk.fulfilled.match(result)) {
            setTitle("");
            setDescription("");
            setUrl("");
            setIsAdding(false);
        }
    };

    const getTypeIcon = (type: FeaturedType) => {
        switch (type) {
            case 'PROJECT': return <Layout size={18} />;
            case 'POST': return <Type size={18} />;
            default: return <ExternalLink size={18} />;
        }
    };

    return (
        <div className="space-y-0">
            <div className="p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white">Ma Sélection</h2>
                    <Pin size={16} className="text-neutral-400 -rotate-45" />
                </div>
                {isCurrentUser && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1.5 text-[#0A66C2] hover:bg-neutral-50 dark:hover:bg-neutral-800 px-3 py-1 rounded transition-colors text-[13px] md:text-[14px] font-semibold"
                    >
                        <Plus size={18} /> <span>Ajouter</span>
                    </button>
                )}
            </div>

            <div className="p-4 md:p-6">
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                    {featuredItems.length > 0 ? (
                        featuredItems.map((item) => (
                            <div
                                key={item.id}
                                className="w-[280px] md:w-[320px] shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all group relative flex flex-col"
                            >
                                <div className="p-5 flex-1 flex flex-col min-h-[200px]">
                                    <div className="flex items-center gap-2 mb-3 text-neutral-400">
                                        {getTypeIcon(item.type)}
                                        <span className="text-[11px] font-bold uppercase tracking-tight">Sélection</span>
                                    </div>
                                    <h3 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-2 leading-snug group-hover:text-[#0A66C2] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-[13px] text-neutral-600 dark:text-neutral-400 line-clamp-4 leading-relaxed mb-4 flex-1">
                                        {item.description}
                                    </p>

                                    <div className="mt-auto">
                                        <a
                                            href={item.external_url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#0A66C2] text-[14px] font-semibold text-[#0A66C2] rounded-full hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm"
                                        >
                                            En savoir plus
                                        </a>
                                    </div>
                                </div>

                                {isCurrentUser && (
                                    <button
                                        onClick={() => dispatch(deleteFeaturedThunk(item.id))}
                                        className="absolute top-3 right-3 p-1.5 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 rounded-full opacity-0 group-hover:opacity-100 hover:text-red-500 shadow-sm transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        !isAdding && (
                            <div className="w-full flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                                <Pin size={32} className="text-neutral-300 mb-2" />
                                <p className="text-sm text-neutral-500 italic text-center max-w-xs">Mettez en avant vos plus belles réussites (projets, articles, démos).</p>
                            </div>
                        )
                    )}

                    {isAdding && (
                        <div className="w-[300px] md:w-[340px] shrink-0 bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 tracking-tight">Titre de l'élément</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="ex: mon portfolio 2024"
                                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 tracking-tight">Description courte</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="décrivez brièvement pourquoi c'est important..."
                                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors resize-none h-24"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 tracking-tight">Lien (URL)</label>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={!title.trim() || !url.trim() || isLoading}
                                    className="flex-1 px-5 py-2 bg-[#0A66C2] text-white text-sm font-semibold rounded hover:bg-[#004182] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Épingler"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
