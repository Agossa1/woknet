"use client";

import React, { useEffect, useState } from 'react';
import {
    PlayCircle, ArrowLeft, LayoutGrid, List, Search, BookOpen,
    Plus, X, ChevronDown, GraduationCap, Star, Users, DollarSign, LayoutDashboard, Loader2, Upload, ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { getMarketplaceCoursesThunk, createCourseThunk, getCategoriesThunk } from '@/src/features/learnings/services/learnings-thunks';
import { selectMarketplaceCourses, selectLearningsLoading, selectCourseCategories } from '@/src/features/learnings/services/learnings-selectors';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { Course, CreateCourseDTO } from '@/src/features/learnings/services/learnings-types';
import { Suspense } from 'react';
import { learningsApi } from '@/src/features/learnings/services/learnings-api';

// Initial categories will be fetched from DB
const LEVELS: { label: string; value: string }[] = [
    { label: 'Tous niveaux', value: '' },
    { label: 'Débutant', value: 'BEGINNER' },
    { label: 'Intermédiaire', value: 'INTERMEDIATE' },
    { label: 'Avancé', value: 'ADVANCED' },
];

const iconStroke = 1.25;

function CourseCard({ course }: { course: Course }) {
    return (
        <Link
            href={`/learnings/${course.slug}`}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#0A66C2] transition-colors duration-300 shadow-sm rounded-lg flex flex-col overflow-hidden"
        >
            <div className="aspect-video relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={40} strokeWidth={iconStroke} className="text-neutral-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/95 backdrop-blur rounded flex items-center justify-center text-neutral-900 shadow-sm scale-90 group-hover:scale-100 transition-transform opacity-0 group-hover:opacity-100">
                        <PlayCircle size={20} strokeWidth={iconStroke} className="ml-1" />
                    </div>
                </div>
            </div>
            <div className="p-5 flex-grow min-w-0 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                    {course.category && (
                        <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-200 dark:border-neutral-700">
                            {course.category}
                        </span>
                    )}
                    {course.level && (
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                            {course.level === 'BEGINNER' ? 'Débutant' : course.level === 'INTERMEDIATE' ? 'Intermédiaire' : 'Avancé'}
                        </span>
                    )}
                </div>
                <h3 className="text-[15px] font-semibold text-neutral-800 dark:text-white line-clamp-2 font-inter mb-1.5 group-hover:text-[#0A66C2] transition-colors">
                    {course.title}
                </h3>
                <div className="text-[12px] text-neutral-500 font-medium italic line-clamp-2 mb-4">
                    {course.description || 'Formation professionnelle de qualité.'}
                </div>
                <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500">
                        {course.author_avatar && (
                            <img src={course.author_avatar} alt="Instructeur" className="w-5 h-5 rounded grayscale border border-neutral-200 dark:border-neutral-700" />
                        )}
                        <span>{course.author_name || 'Instructeur'}</span>
                    </div>
                    <span className="text-[13px] font-bold text-neutral-900 dark:text-white">
                        {Number(course.price) === 0 ? 'Gratuit' : `€${Number(course.price).toFixed(2)}`}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function LearningsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const courses = useAppSelector(selectMarketplaceCourses);
    const categories = useAppSelector(selectCourseCategories);
    const isLoading = useAppSelector(selectLearningsLoading);
    const user = useAppSelector(selectAuthUser);

    // File upload state
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Browsing state
    const [selectedCategory, setSelectedCategory] = useState('Toutes');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Creation wizard: 'none' | 'become-instructor' | 'create-course'
    const [creationStep, setCreationStep] = useState<'none' | 'become-instructor' | 'create-course'>('none');
    const [formData, setFormData] = useState<CreateCourseDTO & { slug: string }>({
        title: '', slug: '', description: '', thumbnail_url: '',
        price: 0, currency: 'EUR', level: 'BEGINNER', category_id: '',
        learning_objectives: [''], requirements: [''], target_audience: [''],
        long_description: ''
    });

    const searchParams = useSearchParams();
    const createFlag = searchParams.get('create');

    useEffect(() => {
        dispatch(getCategoriesThunk());
    }, [dispatch]);

    useEffect(() => {
        if (createFlag === 'true' && user?.is_instructor) {
            setCreationStep('create-course');
        } else if (createFlag === 'true' && user && !user.is_instructor) {
            setCreationStep('become-instructor');
        }
    }, [createFlag, user]);

    useEffect(() => {
        dispatch(getMarketplaceCoursesThunk({
            category: selectedCategory !== 'Toutes' ? selectedCategory : undefined,
            level: selectedLevel || undefined,
        }));
    }, [dispatch, selectedCategory, selectedLevel]);

    const filteredCourses = courses.filter(c =>
        search === '' ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.description ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await learningsApi.uploadThumbnail(file);
            if (response.success) {
                setFormData(prev => ({ ...prev, thumbnail_url: response.data.url }));
            }
        } catch (error) {
            console.error("Upload thumbnail failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await dispatch(createCourseThunk(formData));
        if (createCourseThunk.fulfilled.match(res)) {
            setCreationStep('none');
            setFormData({
                title: '', slug: '', description: '', thumbnail_url: '',
                price: 0, currency: 'EUR', level: 'BEGINNER', category_id: '',
                learning_objectives: [''], requirements: [''], target_audience: [''],
                long_description: ''
            });
            // Redirect to instructor dashboard after creation
            router.replace('/learnings/instructor');
        }
    };

    const handleCancelCreation = () => {
        setCreationStep('none');
        // Clear search params
        router.push('/learnings');
    };

    // ── WIZARD: Step 1 — Become an Instructor → redirect to dedicated page ──────
    // (handled by the Link button below — no inline screen needed)
    // ── WIZARD: Step 2 — Create Course Form ───────────────────────────────────
    if (creationStep === 'create-course') {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans">
                {/* Sticky top bar */}
                <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-8 h-14 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <button
                        onClick={handleCancelCreation}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                        <ArrowLeft size={14} /> Retour
                    </button>
                    <h2 className="font-semibold text-sm text-neutral-700 dark:text-neutral-200 font-inter">Créer une formation</h2>
                    <button onClick={handleCancelCreation} className="text-xs font-semibold text-[#0A66C2] hover:underline">
                        Annuler
                    </button>
                </div>

                <div className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left: Form */}
                    <div className="space-y-10">
                        <div>
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2 font-inter tracking-tight">
                                Informations de votre formation
                            </h1>
                            <p className="text-sm text-neutral-500 font-medium">
                                Les champs marqués d'un * sont requis pour la publication.
                            </p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6 bg-white dark:bg-neutral-900 p-8 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Titre de la formation *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => {
                                        const title = e.target.value;
                                        setFormData({ ...formData, title, slug: generateSlug(title) });
                                    }}
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                    placeholder="Ex: Masterclass UI Design: De Zéro à Pro"
                                />
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">URL de la formation *</label>
                                <div className="flex rounded border border-neutral-300 dark:border-neutral-700 overflow-hidden focus-within:ring-1 focus-within:ring-[#0A66C2] focus-within:border-[#0A66C2] transition-all">
                                    <span className="bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5 text-xs text-neutral-500 font-medium border-r border-neutral-200 dark:border-neutral-700 whitespace-nowrap">
                                        worknet.com/learnings/
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        className="flex-1 bg-transparent px-4 py-2.5 outline-none font-medium text-sm"
                                    />
                                </div>
                            </div>

                            {/* Thumbnail Upload */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Image de couverture *</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group ${formData.thumbnail_url
                                        ? 'border-transparent'
                                        : 'border-neutral-200 dark:border-neutral-800 hover:border-[#0A66C2] bg-neutral-50 dark:bg-neutral-900/50'
                                        }`}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={24} className="animate-spin text-[#0A66C2]" />
                                            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Téléchargement...</span>
                                        </div>
                                    ) : formData.thumbnail_url ? (
                                        <>
                                            <img src={formData.thumbnail_url} alt="Aperçu" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-white text-neutral-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2">
                                                    <Upload size={14} /> Modifier l'image
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-100 dark:border-neutral-800 shadow-sm mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <ImageIcon size={20} className="text-neutral-400 group-hover:text-[#0A66C2] transition-colors" />
                                            </div>
                                            <h3 className="text-[13px] font-bold text-neutral-900 dark:text-white mb-1">Cliquer pour uploader</h3>
                                            <p className="text-[11px] text-neutral-500 font-medium">PNG, JPG ou WEBP (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleThumbnailUpload}
                                />
                            </div>

                            {/* Category + Level */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Catégorie *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.category_id}
                                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] text-sm font-medium appearance-none"
                                        >
                                            <option value="" disabled>Choisir...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} strokeWidth={iconStroke} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Niveau *</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.level}
                                            onChange={e => setFormData({ ...formData, level: e.target.value as any })}
                                            className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] text-sm font-medium appearance-none"
                                        >
                                            <option value="BEGINNER">Débutant</option>
                                            <option value="INTERMEDIATE">Intermédiaire</option>
                                            <option value="ADVANCED">Avancé</option>
                                        </select>
                                        <ChevronDown size={16} strokeWidth={iconStroke} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Prix (€) — 0 = Gratuit</label>
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium"
                                    placeholder="89.00"
                                />
                            </div>

                            {/* Description courte */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Description courte *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium resize-none h-20"
                                    placeholder="Une phrase d'accroche pour le catalogue..."
                                />
                            </div>

                            {/* Description détaillée */}
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400">Description détaillée</label>
                                <textarea
                                    value={formData.long_description}
                                    onChange={e => setFormData({ ...formData, long_description: e.target.value })}
                                    className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2.5 outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all text-sm font-medium resize-none h-40"
                                    placeholder="Le contenu complet, les détails de la méthode, etc."
                                />
                            </div>

                            {/* Learning Objectives */}
                            <div className="space-y-3">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                                    Ce que les élèves vont apprendre *
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, learning_objectives: [...(formData.learning_objectives || []), ''] })}
                                        className="text-[#0A66C2] flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={14} /> Ajouter
                                    </button>
                                </label>
                                {formData.learning_objectives?.map((obj, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={obj}
                                            onChange={e => {
                                                const newObj = [...(formData.learning_objectives || [])];
                                                newObj[i] = e.target.value;
                                                setFormData({ ...formData, learning_objectives: newObj });
                                            }}
                                            className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2 outline-none focus:border-[#0A66C2] text-sm font-medium"
                                            placeholder="Ex: Maîtriser les auto-layouts dans Figma"
                                        />
                                        {formData.learning_objectives!.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, learning_objectives: formData.learning_objectives?.filter((_, index) => index !== i) })}
                                                className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Requirements */}
                            <div className="space-y-3">
                                <label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                                    Prérequis
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, requirements: [...(formData.requirements || []), ''] })}
                                        className="text-[#0A66C2] flex items-center gap-1 hover:underline"
                                    >
                                        <Plus size={14} /> Ajouter
                                    </button>
                                </label>
                                {formData.requirements?.map((req, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={req}
                                            onChange={e => {
                                                const newReq = [...(formData.requirements || [])];
                                                newReq[i] = e.target.value;
                                                setFormData({ ...formData, requirements: newReq });
                                            }}
                                            className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-4 py-2 outline-none focus:border-[#0A66C2] text-sm font-medium"
                                            placeholder="Ex: Avoir des bases en HTML/CSS"
                                        />
                                        {formData.requirements!.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, requirements: formData.requirements?.filter((_, index) => index !== i) })}
                                                className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex items-start gap-3">
                                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0A66C2]" />
                                <p className="text-[11px] text-neutral-500 leading-normal">
                                    Je certifie être l'auteur de ce contenu et accepte les conditions générales de WorkNet Academy applicables aux formateurs.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !formData.title || !formData.slug}
                                className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-4 shadow-sm"
                            >
                                {isLoading ? 'Publication...' : 'Publier ma formation'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:sticky lg:top-32 hidden lg:block">
                        <h3 className="text-xs font-semibold text-neutral-400 mb-4 tracking-tight">Aperçu en temps réel</h3>
                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
                            <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
                                {formData.thumbnail_url ? (
                                    <img src={formData.thumbnail_url} alt="Aperçu" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen size={40} strokeWidth={1} className="text-neutral-300" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    {formData.category_id && (
                                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-200">
                                            {categories.find(c => c.id === formData.category_id)?.name}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-[15px] font-semibold text-neutral-800 dark:text-white mb-1.5 font-inter line-clamp-2">
                                    {formData.title || 'Titre de votre formation'}
                                </h3>
                                <p className="text-[12px] text-neutral-500 italic line-clamp-2 mb-4">
                                    {formData.description || 'La description de votre formation apparaîtra ici.'}
                                </p>

                                {formData.learning_objectives && formData.learning_objectives.filter(o => o.trim()).length > 0 && (
                                    <div className="mb-4 space-y-1.5">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Au programme</p>
                                        <ul className="space-y-1">
                                            {formData.learning_objectives.filter(o => o.trim()).slice(0, 3).map((obj, i) => (
                                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-neutral-600 font-medium">
                                                    <div className="mt-1 w-1 h-1 rounded-full bg-[#0A66C2] flex-shrink-0" />
                                                    <span className="line-clamp-1">{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-neutral-400">Vous</span>
                                    <span className="text-[13px] font-bold text-neutral-900 dark:text-white">
                                        {Number(formData.price) === 0 ? 'Gratuit' : `€${Number(formData.price).toFixed(2)}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── DEFAULT VIEW : Marketplace ─────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black p-6 md:p-10 font-sans antialiased text-neutral-800">
            <div className="max-w-5xl mx-auto w-full">
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-300/60 dark:border-neutral-800">
                        <div>
                            <Link href="/feed" className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-2">
                                <ArrowLeft size={14} />
                                <span>Retour à l'accueil</span>
                            </Link>
                            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">WorkNet Academy</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 font-medium">
                                Développez votre expertise avec des formations premium.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={16} strokeWidth={iconStroke} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded font-medium text-[13px] outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-colors w-48 text-neutral-900 dark:text-white"
                                />
                            </div>
                            {/* Bouton conditionnel selon le statut formateur */}
                            {user?.is_instructor ? (
                                <Link
                                    href="/learnings/instructor"
                                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-[#0A66C2] hover:text-[#0A66C2] px-4 py-2 rounded font-semibold transition-all flex items-center gap-2 text-[13px] shadow-sm"
                                >
                                    <LayoutDashboard size={15} strokeWidth={iconStroke} />
                                    Mon espace
                                </Link>
                            ) : (
                                <Link
                                    href="/learnings/instructor/apply"
                                    className="bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2.5 rounded font-semibold transition-all flex items-center gap-2 text-[13px] shadow-sm"
                                >
                                    <Plus size={16} strokeWidth={2.5} />
                                    Devenir Formateur
                                </Link>
                            )}
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded p-1 flex items-center shadow-sm">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-neutral-900 dark:bg-white text-white dark:text-black' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'}`}
                                >
                                    <LayoutGrid size={16} strokeWidth={iconStroke} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-neutral-900 dark:bg-white text-white dark:text-black' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'}`}
                                >
                                    <List size={16} strokeWidth={iconStroke} />
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('Toutes')}
                            className={`px-4 py-1.5 text-[13px] font-semibold rounded transition-colors shadow-sm ${selectedCategory === 'Toutes'
                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-[#0A66C2] hover:text-[#0A66C2]'
                                }`}
                        >
                            Toutes
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-4 py-1.5 text-[13px] font-semibold rounded transition-colors shadow-sm ${selectedCategory === cat.name
                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-[#0A66C2] hover:text-[#0A66C2]'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                        <select
                            value={selectedLevel}
                            onChange={e => setSelectedLevel(e.target.value)}
                            className="ml-auto px-3 py-1.5 text-[13px] font-semibold rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 focus:outline-none focus:border-[#0A66C2] shadow-sm cursor-pointer"
                        >
                            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>

                    {/* Courses Grid */}
                    {isLoading ? (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-56 rounded-lg border border-neutral-200 bg-white/50 animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-20 text-center shadow-sm">
                            <BookOpen size={40} strokeWidth={1} className="text-neutral-200 mx-auto mb-6" />
                            <h3 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-2 font-inter">Aucune formation disponible</h3>
                            <p className="text-xs text-neutral-500 mb-8 max-w-[280px] mx-auto font-medium">
                                Soyez le premier à partager votre expertise sur WorkNet Academy.
                            </p>
                            <button
                                onClick={() => setCreationStep('become-instructor')}
                                className="text-[#0A66C2] font-semibold hover:underline text-sm"
                            >
                                + Créer ma première formation
                            </button>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {filteredCourses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
// Export with Suspense for useSearchParams
export default function LearningsPageWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center"><Loader2 className="animate-spin text-neutral-400" /></div>}>
            <LearningsPage />
        </Suspense>
    );
}
