import { useState, useEffect } from "react";
import { Plus, X, Loader2, Award, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectCertifications, selectCertificationsLoading } from "../services/certification-slices";
import { addCertificationThunk, deleteCertificationThunk, getProfileCertificationsThunk } from "../services/certification-thunks";

interface CertificationsSectionProps {
    profileId: string;
    isCurrentUser?: boolean;
}

export const CertificationsSection = ({ profileId, isCurrentUser = false }: CertificationsSectionProps) => {
    const dispatch = useAppDispatch();
    const certifications = useAppSelector(selectCertifications);
    const isLoading = useAppSelector(selectCertificationsLoading);

    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState("");
    const [org, setOrg] = useState("");
    const [url, setUrl] = useState("");

    useEffect(() => {
        if (profileId) {
            dispatch(getProfileCertificationsThunk(profileId));
        }
    }, [profileId, dispatch]);

    const handleAdd = async () => {
        if (!name.trim() || !org.trim()) return;
        const result = await dispatch(addCertificationThunk({
            profile_id: profileId,
            name: name.trim(),
            issuing_organization: org.trim(),
            credential_url: url.trim() || null
        }));
        if (addCertificationThunk.fulfilled.match(result)) {
            setName("");
            setOrg("");
            setUrl("");
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-0">
            <div className="p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white">Licences et Certifications</h2>
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
                {certifications.length > 0 ? (
                    certifications.map((cert) => (
                        <div key={cert.id} className="p-4 md:p-6 flex gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center shrink-0">
                                <Award size={22} className="text-neutral-400" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <h3 className="text-[14px] md:text-[15px] font-bold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors truncate">
                                    {cert.name}
                                </h3>
                                <p className="text-[13px] md:text-[14px] text-neutral-700 dark:text-neutral-300 font-medium">
                                    {cert.issuing_organization}
                                </p>
                                {cert.credential_url && (
                                    <div className="mt-3">
                                        <a
                                            href={cert.credential_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-full text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 transition-all"
                                        >
                                            Afficher le diplôme
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                )}
                            </div>
                            {isCurrentUser && (
                                <button
                                    onClick={() => dispatch(deleteCertificationThunk(cert.id))}
                                    className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all opacity-0 group-hover:opacity-100 h-fit"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    !isAdding && (
                        <div className="py-12 p-6 text-center text-sm text-neutral-400 italic">
                            Aucune certification ajoutée pour le moment.
                        </div>
                    )
                )}

                {isAdding && (
                    <div className="p-4 md:p-6 bg-neutral-50/50 dark:bg-neutral-800/20 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 tracking-tight">Nom de la certification</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ex: Google UX Design Certificate..."
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 tracking-tight">Organisme de délivrance</label>
                                <input
                                    type="text"
                                    value={org}
                                    onChange={(e) => setOrg(e.target.value)}
                                    placeholder="ex: Coursera, Microsoft..."
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-neutral-500 dark:text-neutral-400 tracking-tight">Lien vers le justificatif (URL)</label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-[#0A66C2] transition-colors"
                                />
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
                                disabled={!name.trim() || !org.trim() || isLoading}
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
