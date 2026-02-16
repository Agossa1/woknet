import { useState, useEffect, useRef } from "react";
import { X, Loader2, Calendar, Link as LinkIcon, Image as ImageIcon, Github, Globe, Youtube, Linkedin, Video, Upload, Trash2 } from "lucide-react";
import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectLinkType, LINK_PLATFORM_LABELS } from "@/src/features/projects/services/projects-types";
import { projectsApi } from "@/src/features/projects/services/projects-api";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateProjectDTO | UpdateProjectDTO) => Promise<void>;
    project?: Project | null;
    profileId: string;
}

const INITIAL_FORM_STATE: Partial<CreateProjectDTO> = {
    title: '',
    description: '',
    presentation_url: '',
    repository_url: '',
    thumbnail_url: '',
    link_platform: ProjectLinkType.OTHER,
    is_ongoing: false,
    start_date: '',
    completion_date: ''
};

export const ProjectModal = ({ isOpen, onClose, onSave, project, profileId }: ProjectModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<CreateProjectDTO>>(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (project) {
            setFormData({
                title: project.title,
                description: project.description || '',
                presentation_url: project.presentation_url,
                repository_url: project.repository_url || '',
                thumbnail_url: project.thumbnail_url || '',
                link_platform: project.link_platform || ProjectLinkType.OTHER,
                is_ongoing: project.is_ongoing || false,
                start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
                completion_date: project.completion_date ? new Date(project.completion_date).toISOString().split('T')[0] : ''
            });
        } else {
            setFormData(INITIAL_FORM_STATE);
        }
        setErrors({});
    }, [project, isOpen]);

    const handleChange = (field: keyof CreateProjectDTO, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith('image/')) {
            alert("Veuillez sélectionner une image.");
            return;
        }

        setIsUploading(true);
        try {
            const response = await projectsApi.uploadProjectThumbnail(file);
            if (response.success) {
                handleChange('thumbnail_url', response.data.url);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Échec du téléchargement de l'image.");
        } finally {
            setIsUploading(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title?.trim()) newErrors.title = "Le titre est requis";
        if (!formData.presentation_url?.trim()) newErrors.presentation_url = "Le lien de présentation est requis";

        // Basic URL validation
        if (formData.presentation_url && !isValidUrl(formData.presentation_url)) {
            newErrors.presentation_url = "URL invalide (inclure http:// ou https://)";
        }
        if (formData.repository_url && !isValidUrl(formData.repository_url)) {
            newErrors.repository_url = "URL invalide";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string: string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const payload: any = {
                ...formData,
                profile_id: profileId,
                start_date: formData.start_date || null,
                completion_date: formData.is_ongoing ? null : (formData.completion_date || null),
            };

            if (project) {
                payload.id = project.id;
            }

            await onSave(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold tracking-tight">
                        {project ? 'Modifier le projet' : 'Ajouter un projet'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Thumbnail Upload Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold flex items-center gap-2">
                            <ImageIcon size={14} /> Image de couverture
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group cursor-pointer aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center gap-3"
                        >
                            {formData.thumbnail_url ? (
                                <>
                                    <img src={formData.thumbnail_url} className="w-full h-full object-cover" alt="Project Thumbnail" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                                            <Upload size={14} /> Modifier l'image
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleChange('thumbnail_url', ''); }}
                                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-white dark:bg-gray-900 rounded-full shadow-sm text-gray-400">
                                        {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold">Cliquez pour télécharger une image</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG jusqu'à 5MB</p>
                                    </div>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold mb-2">Titre du projet <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                            placeholder="Ex: WorkNet Platform"
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all resize-none"
                            placeholder="En quelques mots, quel est l'objectif de ce projet ?"
                        />
                    </div>

                    {/* Secondary Info Row: Dates & Ongoing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-sm font-bold flex items-center gap-2"><Calendar size={14} /> Calendrier</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Début</p>
                                    <input
                                        type="date"
                                        value={formData.start_date?.toString()}
                                        onChange={(e) => handleChange('start_date', e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:border-black dark:focus:border-white transition-all"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Fin</p>
                                    <input
                                        type="date"
                                        value={formData.completion_date?.toString()}
                                        onChange={(e) => handleChange('completion_date', e.target.value)}
                                        disabled={formData.is_ongoing}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:border-black dark:focus:border-white transition-all disabled:opacity-30"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <input
                                    type="checkbox"
                                    id="is_ongoing_project"
                                    checked={formData.is_ongoing}
                                    onChange={(e) => handleChange('is_ongoing', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                                />
                                <label htmlFor="is_ongoing_project" className="text-xs font-bold text-gray-500 cursor-pointer select-none">Ce projet est encore en cours</label>
                            </div>
                        </div>

                        {/* Platform selectivity */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold flex items-center gap-2">Plateforme</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(LINK_PLATFORM_LABELS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleChange('link_platform', key)}
                                        className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all uppercase tracking-tight ${formData.link_platform === key
                                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Links Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                                <LinkIcon size={14} /> Lien de présentation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                value={formData.presentation_url}
                                onChange={(e) => handleChange('presentation_url', e.target.value)}
                                className={`w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all ${errors.presentation_url ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                                placeholder="Lien vers le site ou démo"
                            />
                            {errors.presentation_url && <p className="text-red-500 text-xs mt-1 font-medium">{errors.presentation_url}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                                <LinkIcon size={14} /> Lien source / Portfolio (Optionnel)
                            </label>
                            <input
                                type="url"
                                value={formData.repository_url}
                                onChange={(e) => handleChange('repository_url', e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                placeholder="Lien GitHub, Behance, Notion..."
                            />
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting || isUploading}
                        className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition shadow-lg disabled:opacity-70"
                    >
                        {(isSubmitting || isUploading) && <Loader2 size={16} className="animate-spin" />}
                        {project ? 'Enregistrer les modifications' : 'Ajouter le projet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

