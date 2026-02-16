'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { selectEducationsLoading } from '@/src/features/educations/services/education-selectors';
import { createEducationThunk, updateEducationThunk } from '@/src/features/educations/services/education-thunks';
import { Education, DegreeLevel, DEGREE_LABELS } from '@/src/features/educations/services/education-types';
import { X, Plus, Loader2 } from 'lucide-react';

interface EducationModalProps {
    education: Education | null;
    onClose: () => void;
}

export const EducationModal = ({ education, onClose }: EducationModalProps) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);
    const isLoading = useAppSelector(selectEducationsLoading);

    const [formData, setFormData] = useState({
        school_name: '',
        degree: DegreeLevel.BACHELOR,
        field_of_study: '',
        start_date: '',
        end_date: '',
        is_current: false,
        location: '',
        description: '',
        stack: ''
    });

    const [stackInput, setStackInput] = useState('');

    useEffect(() => {
        if (education) {
            setFormData({
                school_name: education.school_name,
                degree: education.degree,
                field_of_study: education.field_of_study,
                start_date: education.start_date ? new Date(education.start_date).toISOString().split('T')[0] : '',
                end_date: education.end_date ? new Date(education.end_date).toISOString().split('T')[0] : '',
                is_current: education.is_current,
                location: education.location || '',
                description: education.description || '',
                stack: education.stack || ''
            });
        }
    }, [education]);

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

        if (education) {
            await dispatch(updateEducationThunk({ id: education.id, dto: dto as any }));
        } else {
            await dispatch(createEducationThunk(dto as any));
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
                            {education ? 'Modifier la formation' : 'Ajouter une formation'}
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
                                    École / Université *
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="school_name"
                                    value={formData.school_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                    placeholder="Université de Paris"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                    Domaine d'études *
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="field_of_study"
                                    value={formData.field_of_study}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                    placeholder="Informatique"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                Niveau de diplôme
                            </label>
                            <select
                                name="degree"
                                value={formData.degree}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                            >
                                {Object.entries(DegreeLevel).map(([key, value]) => (
                                    <option key={key} value={value}>{DEGREE_LABELS[key as DegreeLevel] || key}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                Localisation
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium text-sm transition-all"
                                placeholder="Paris, France"
                            />
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
                                Je suis actuellement en formation
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
                                placeholder="Décrivez votre formation..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                                Technologies / Compétences acquises
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
                                    placeholder="Ajouter une compétence (Enter ou virgule)"
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
                            {education ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
