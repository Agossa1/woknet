'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { selectExperiencesLoading } from '@/src/features/experiences/services/experience-selectors';
import { createExperienceThunk, updateExperienceThunk } from '@/src/features/experiences/services/experience-thunks';
import { Experience, ExperienceTypeJob, ExperienceTypePlace } from '@/src/features/experiences/services/experience-types';
import { X, Plus, Loader2 } from 'lucide-react';

const JOB_TYPE_LABELS: Record<string, string> = {
    FULL_TIME: 'Temps plein',
    PART_TIME: 'Temps partiel',
    PERMANENT: 'CDI',
    FIXED_TERM: 'CDD',
    TEMPORARY: 'Intérim',
    FREELANCE: 'Freelance',
    SELF_EMPLOYED: 'Indépendant',
    INTERNSHIP: 'Stage',
    APPRENTICESHIP: 'Alternance',
    REMOTE: 'Télétravail',
    VOLUNTEER: 'Bénévolat'
};

const PLACE_TYPE_LABELS: Record<string, string> = {
    ONSITE: 'Sur site',
    HYBRID: 'Hybride',
    REMOTE: 'Télétravail',
    MOBILE: 'Mobile',
    TRAVEL_BASED: 'Déplacements',
    OFFSHORE: 'Offshore',
    COWORKING: 'Coworking',
    FLEXIBLE: 'Flexible'
};

interface ExperienceModalProps {
    experience: Experience | null;
    onClose: () => void;
}

export const ExperienceModal = ({ experience, onClose }: ExperienceModalProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);
    const isLoading = useAppSelector(selectExperiencesLoading);

    const [formData, setFormData] = useState({
        title: '',
        company_name: '',
        type_job: ExperienceTypeJob.FULL_TIME,
        type_place: ExperienceTypePlace.ONSITE,
        start_date: '',
        end_date: '',
        is_current: false,
        country: '',
        city: '',
        description: '',
        stack: ''
    });

    const [stackInput, setStackInput] = useState('');

    useEffect(() => {
        if (experience) {
            setFormData({
                title: experience.title,
                company_name: experience.company_name,
                type_job: experience.type_job,
                type_place: experience.type_place,
                start_date: experience.start_date ? new Date(experience.start_date).toISOString().split('T')[0] : '',
                end_date: experience.end_date ? new Date(experience.end_date).toISOString().split('T')[0] : '',
                is_current: experience.is_current,
                country: experience.country || '',
                city: experience.city || '',
                description: experience.description || '',
                stack: experience.stack || ''
            });
        }
    }, [experience]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleAddStackTag = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
        e.preventDefault();

        const tag = stackInput.trim().replace(/,$/, '');
        if (!tag) return;

        const currentTags = formData.stack ? formData.stack.split(',').map(t => t.trim()).filter(Boolean) : [];
        if (!currentTags.includes(tag)) {
            const newStack = [...currentTags, tag].join(', ');
            setFormData(prev => ({ ...prev, stack: newStack }));
        }
        setStackInput('');
    };

    const handleRemoveStackTag = (tagToRemove: string) => {
        const currentTags = formData.stack ? formData.stack.split(',').map(t => t.trim()).filter(Boolean) : [];
        const newStack = currentTags.filter(t => t !== tagToRemove).join(', ');
        setFormData(prev => ({ ...prev, stack: newStack }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const dto = {
            ...formData,
            profile_id: user.id,
            end_date: formData.end_date === '' ? null : formData.end_date,
            description: formData.description || undefined,
            stack: formData.stack || undefined,
        };

        if (experience) {
            await dispatch(updateExperienceThunk({ id: experience.id, dto: dto as any }));
        } else {
            await dispatch(createExperienceThunk(dto as any));
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
                        <h3 className="text-lg font-bold">
                            {experience ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Titre du poste *
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                    placeholder="Développeur Web"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Entreprise *
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                    placeholder="Nom de l'entreprise"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Type d'emploi
                                </label>
                                <select
                                    name="type_job"
                                    value={formData.type_job}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                >
                                    {Object.entries(ExperienceTypeJob).map(([key, value]) => (
                                        <option key={key} value={value}>{JOB_TYPE_LABELS[key] || key}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Lieu de travail
                                </label>
                                <select
                                    name="type_place"
                                    value={formData.type_place}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                >
                                    {Object.entries(ExperienceTypePlace).map(([key, value]) => (
                                        <option key={key} value={value}>{PLACE_TYPE_LABELS[key] || key}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Ville *
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                    placeholder="Paris"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Pays *
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                    placeholder="France"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Date de début *
                                </label>
                                <input
                                    required
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Date de fin
                                </label>
                                <input
                                    disabled={formData.is_current}
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all disabled:opacity-30"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_current"
                                id="is_current"
                                checked={formData.is_current}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                            />
                            <label htmlFor="is_current" className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer">
                                Je travaille actuellement ici
                            </label>
                        </div>

                        <div>
                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 min-h-[80px] resize-none text-sm transition-all"
                                placeholder="Décrivez vos missions..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                Technologies / Stack
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.stack && formData.stack.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStackTag(tag)}
                                            className="hover:text-red-500 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={stackInput}
                                    onChange={(e) => setStackInput(e.target.value)}
                                    onKeyDown={handleAddStackTag}
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                    placeholder="Ajouter une techno (Enter ou virgule)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddStackTag}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 size={14} className="animate-spin" />}
                            {experience ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
