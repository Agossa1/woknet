"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
    Save, Plus, LayoutDashboard, Settings, Video, FileText,
    GripVertical, Trash2, Edit2, ChevronDown, ChevronUp,
    PlayCircle, Play, CheckCircle, Info, ArrowLeft, Loader2,
    BookOpen, List, Target, Users, Book, X, Upload, ImageIcon, Layout
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
    getChaptersByCourseIdThunk,
    createChapterThunk,
    createLessonThunk,
    updateLessonThunk,
    getCourseByIdThunk,
    updateCourseThunk,
    getCategoriesThunk
} from '@/src/features/learnings/services/learnings-thunks';
import {
    selectCurrentCourse,
    selectCurrentChapters,
    selectLearningsLoading,
    selectLearningsError,
    selectCourseCategories
} from '@/src/features/learnings/services/learnings-selectors';
import { useRequireInstructor } from '@/src/hooks/useRequireAuth';
import { clearCurrentCourse } from '@/src/features/learnings/services/learnings-slice';
import { learningsApi } from '@/src/features/learnings/services/learnings-api';

const iconStroke = 1.5;

type Tab = 'curriculum' | 'details' | 'settings';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, isInstructor } = useRequireInstructor();
    const course = useAppSelector(selectCurrentCourse);
    const chapters = useAppSelector(selectCurrentChapters);
    const categories = useAppSelector(selectCourseCategories);
    const isLoading = useAppSelector(selectLearningsLoading);
    const apiError = useAppSelector(selectLearningsError);

    const [activeTab, setActiveTab] = useState<Tab>('curriculum');
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    // Form states for adding stuff
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [isAddingChapter, setIsAddingChapter] = useState(false);
    const [isCreatingChapterBatch, setIsCreatingChapterBatch] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any>(null);

    useEffect(() => {
        dispatch(getCategoriesThunk());
    }, [dispatch]);

    useEffect(() => {
        // Only fetch if we don't have the right course already
        if (id && (!course || course.id !== id)) {
            dispatch(getCourseByIdThunk(id));
            dispatch(getChaptersByCourseIdThunk(id));
        }
    }, [dispatch, id, course?.id]); // Narrow dependency

    // Cleanup when leaving the page
    useEffect(() => {
        return () => {
            dispatch(clearCurrentCourse());
        };
    }, [dispatch]);

    // Initialize formData when course is loaded
    useEffect(() => {
        if (course && course.id === id && !formData) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                long_description: course.long_description || '',
                thumbnail_url: course.thumbnail_url || '',
                price: course.price || 0,
                level: course.level || 'BEGINNER',
                category_id: course.category_id || '',
                learning_objectives: (course.learning_objectives && course.learning_objectives.length > 0) ? course.learning_objectives : [''],
                requirements: (course.requirements && course.requirements.length > 0) ? course.requirements : [''],
                status: course.status || 'DRAFT'
            });
        }
    }, [course, id, formData]);

    const handleSave = async () => {
        if (!formData) return;
        setIsSaving(true);
        try {
            // Clean objectives and requirements (remove empty strings)
            const cleanedData = {
                ...formData,
                learning_objectives: formData.learning_objectives.filter((s: string) => s.trim() !== ''),
                requirements: formData.requirements.filter((s: string) => s.trim() !== ''),
                price: Number(formData.price)
            };

            await dispatch(updateCourseThunk({ id, dto: cleanedData })).unwrap();
            // Optional: Show toast or success indicator
        } catch (error) {
            console.error("Failed to update course", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateChapter = async () => {
        if (!newChapterTitle.trim()) return;
        setIsCreatingChapterBatch(true);
        try {
            await dispatch(createChapterThunk({
                course_id: id,
                title: newChapterTitle.trim(),
                sort_order: chapters.length + 1
            })).unwrap();
            setNewChapterTitle('');
            setIsAddingChapter(false);
        } catch (error) {
            console.error("Failed to create chapter", error);
        } finally {
            setIsCreatingChapterBatch(false);
        }
    };

    const togglePublishStatus = async () => {
        if (!course || !formData) return;
        setIsSaving(true);
        try {
            const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
            await dispatch(updateCourseThunk({
                id,
                dto: { status: newStatus }
            })).unwrap();
            // Update local formData status to match
            setFormData((prev: any) => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error("Failed to toggle publish status", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isAuthenticated || !isInstructor) return null;

    // 1. Still loading and no data yet? Show big loader
    if (isLoading && !course) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center flex-col gap-4">
                <div className="relative">
                    <Loader2 size={48} className="animate-spin text-[#0A66C2]" strokeWidth={iconStroke} />
                    <BookOpen size={20} className="absolute inset-0 m-auto text-neutral-300" strokeWidth={iconStroke} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">Préparation de l'éditeur</p>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Chargement de la formation...</p>
                </div>
            </div>
        );
    }

    // 2. Not loading (or finished loading) but no course found? Show Error
    if (apiError && !course) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center flex-col gap-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
                    <Info size={32} strokeWidth={iconStroke} />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">Erreur de chargement</p>
                    <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                        {apiError}
                    </p>
                </div>
                <Link href="/learnings/instructor" className="flex items-center gap-2 text-[#0A66C2] font-bold text-sm hover:underline">
                    <ArrowLeft size={16} /> Retour au tableau de bord
                </Link>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center flex-col gap-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <X size={32} className="text-red-500" strokeWidth={iconStroke} />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">Formation introuvable</p>
                    <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                        Nous n'avons pas pu trouver la formation demandée. Elle a peut-être été supprimée ou l'ID est incorrect.
                    </p>
                </div>
                <Link href="/learnings/instructor" className="flex items-center gap-2 text-[#0A66C2] font-bold text-sm hover:underline">
                    <ArrowLeft size={16} /> Retour au tableau de bord
                </Link>
            </div>
        );
    }

    // At this point, course is GUARANTEED to be non-null for the rest of the component

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans antialiased text-neutral-800">
            {/* Top Bar */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-8 h-16 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/learnings/instructor" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500">
                        <ArrowLeft size={20} strokeWidth={iconStroke} />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-neutral-900 dark:text-white font-inter truncate max-w-[300px]">
                            Édition : {course.title}
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                            <span className={`px-1.5 py-0.5 rounded border ${course.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'
                                }`}>
                                {course.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                            </span>
                            <span>•</span>
                            <span>ID: {id.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/learnings/${course.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded text-[13px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all font-inter"
                    >
                        <PlayCircle size={16} strokeWidth={iconStroke} />
                        Aperçu
                    </Link>

                    <button
                        onClick={togglePublishStatus}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-[13px] transition-all font-inter border ${course.status === 'PUBLISHED'
                            ? 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                            : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-md'
                            }`}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : (course.status === 'PUBLISHED' ? 'Repasser en brouillon' : 'Publier')}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || !formData}
                        className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2.5 rounded font-semibold text-[13px] transition-all shadow-md font-inter disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={iconStroke} />}
                        Enregistrer
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex gap-8 p-8">
                {/* Sidebar Navigation */}
                <aside className="w-64 flex-shrink-0 space-y-2">
                    {[
                        { id: 'curriculum', label: 'Programme', icon: <List size={18} strokeWidth={iconStroke} /> },
                        { id: 'details', label: 'Détails du cours', icon: <Target size={18} strokeWidth={iconStroke} /> },
                        { id: 'settings', label: 'Paramètres', icon: <Settings size={18} strokeWidth={iconStroke} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold transition-all group ${activeTab === tab.id
                                ? 'bg-[#0A66C2] text-white shadow-md'
                                : 'text-neutral-500 hover:bg-white dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800'
                                }`}
                        >
                            <span className={activeTab === tab.id ? 'text-white' : 'text-neutral-300 group-hover:text-[#0A66C2] transition-colors'}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="flex-grow min-w-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-8">
                        {activeTab === 'curriculum' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-inter tracking-tight">Constructeur de cours</h2>
                                        <p className="text-[13px] text-neutral-500 font-medium">Structurez votre formation par sections et leçons.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingChapter(true)}
                                        className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded font-semibold text-[12px] hover:bg-neutral-800 transition-all font-inter"
                                    >
                                        <Plus size={14} /> Ajouter un chapitre
                                    </button>
                                </div>

                                {isLoading && chapters.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                                        <Loader2 size={32} className="animate-spin text-neutral-200" strokeWidth={iconStroke} />
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Chargement du contenu...</p>
                                    </div>
                                ) : chapters.length === 0 && !isAddingChapter ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
                                        <Book size={48} className="text-neutral-200 mb-4" strokeWidth={1} />
                                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">Votre programme est vide</h3>
                                        <p className="text-[12px] text-neutral-500 max-w-xs mb-6 font-medium leading-relaxed">
                                            Commencez par ajouter un chapitre pour structurer votre formation.
                                        </p>
                                        <button
                                            onClick={() => setIsAddingChapter(true)}
                                            className="text-[#0A66C2] font-bold text-[13px] hover:underline flex items-center gap-1.5"
                                        >
                                            <Plus size={16} /> Créer mon premier chapitre
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {isAddingChapter && (
                                            <div className="p-6 border-2 border-[#0A66C2]/30 bg-[#0A66C2]/5 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
                                                <h4 className="text-[13px] font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                                    <BookOpen size={16} className="text-[#0A66C2]" strokeWidth={iconStroke} />
                                                    Nouveau Chapitre
                                                </h4>
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={newChapterTitle}
                                                    onChange={e => setNewChapterTitle(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleCreateChapter()}
                                                    placeholder="Titre du chapitre (ex: Introduction au UI Design)"
                                                    className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-3 text-[14px] outline-none focus:border-[#0A66C2] shadow-sm font-medium transition-all"
                                                />
                                                <div className="flex justify-end gap-3 mt-4">
                                                    <button onClick={() => setIsAddingChapter(false)} className="px-4 py-2 text-[12px] font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Annuler</button>
                                                    <button
                                                        onClick={handleCreateChapter}
                                                        disabled={!newChapterTitle.trim() || isCreatingChapterBatch}
                                                        className="px-5 py-2 bg-[#0A66C2] text-white rounded font-bold text-[12px] shadow-sm hover:bg-[#004182] transition-colors disabled:opacity-50"
                                                    >
                                                        {isCreatingChapterBatch ? <Loader2 size={14} className="animate-spin" /> : 'Créer le chapitre'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {chapters.map((chapter, index) => (
                                            <ChapterEditor key={chapter.id} chapter={chapter} index={index + 1} onEditLesson={setEditingLesson} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-inter tracking-tight">Détails du cours</h2>
                                    <p className="text-[13px] text-neutral-500 font-medium">Configurez les informations qui aideront les élèves à choisir votre formation.</p>
                                </div>
                                {formData ? (
                                    <CourseDetailsForm formData={formData} setFormData={setFormData} categories={categories} />
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                                        <Loader2 size={32} className="animate-spin text-[#0A66C2]" strokeWidth={iconStroke} />
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Initialisation du formulaire...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white font-inter tracking-tight">Paramètres avancés</h2>
                                    <p className="text-[13px] text-neutral-500 font-medium">Gérez la visibilité et la suppression de votre formation.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 border border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 rounded-xl">
                                        <h3 className="text-[14px] font-bold text-red-600 mb-2 flex items-center gap-2">
                                            <Trash2 size={16} /> Zone de danger
                                        </h3>
                                        <p className="text-[13px] text-neutral-500 mb-6">
                                            Une fois supprimée, une formation ne peut pas être récupérée. Tous les contenus associés (chapitres, leçons) seront également perdus.
                                        </p>
                                        <button
                                            onClick={() => {
                                                if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
                                                    // TODO: Implement deleteThunk
                                                    alert('Action de suppression à implémenter');
                                                }
                                            }}
                                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[12px] transition-all shadow-sm"
                                        >
                                            Supprimer définitivement la formation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Lesson Content Editor Modal */}
            {editingLesson && (
                <LessonContentEditor
                    lesson={editingLesson}
                    onClose={() => setEditingLesson(null)}
                />
            )}
        </div>
    );
}

// ── Sub-components for Curriculum ─────────────────────────────────────────────

function ChapterEditor({ chapter, index, onEditLesson }: { chapter: any, index: number, onEditLesson: (lesson: any) => void }) {
    const dispatch = useAppDispatch();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [newLessonType, setNewLessonType] = useState<'VIDEO' | 'TEXT' | 'DOCUMENT'>('VIDEO');
    const [isCreatingLesson, setIsCreatingLesson] = useState(false);

    const handleCreateLesson = async () => {
        if (!newLessonTitle.trim()) return;
        setIsCreatingLesson(true);
        try {
            const result = await dispatch(createLessonThunk({
                chapter_id: chapter.id,
                title: newLessonTitle.trim(),
                content_type: newLessonType,
                sort_order: (chapter.lessons?.length || 0) + 1,
                is_free_preview: false
            })).unwrap();
            setNewLessonTitle('');
            setIsAddingLesson(false);

            // Ouvrir l'éditeur immédiatement après la création
            if (result) {
                onEditLesson(result);
            }
        } catch (error) {
            console.error("Failed to create lesson", error);
        } finally {
            setIsCreatingLesson(false);
        }
    };

    return (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm bg-neutral-50/50 dark:bg-neutral-800/30 overflow-hidden transition-all duration-300">
            <div className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="p-1 cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 transition-colors">
                        <GripVertical size={18} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-bold text-[#0A66C2] uppercase tracking-widest bg-[#0A66C2]/10 px-1.5 py-0.5 rounded">Section {index}</span>
                        <h3 className="text-[14px] font-bold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                            {chapter.title}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setIsAddingLesson(true); setIsExpanded(true); }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-[#0A66C2] px-3 py-1.5 border border-[#0A66C2]/30 rounded-full hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 transition-all shadow-sm"
                    >
                        <Plus size={12} strokeWidth={2.5} /> Leçon
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-neutral-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 pt-0 space-y-2 pb-6 px-6">
                    {/* Lessons list */}
                    {chapter.lessons?.map((lesson: any, i: number) => (
                        <LessonRow key={lesson.id} lesson={lesson} index={i + 1} onEdit={onEditLesson} />
                    ))}

                    {isAddingLesson && (
                        <div className="p-5 bg-white dark:bg-neutral-900 border-2 border-[#0A66C2]/20 rounded-xl mt-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-[11px] font-bold text-[#0A66C2] uppercase tracking-widest">Nouvelle Leçon</h5>
                                <button onClick={() => setIsAddingLesson(false)} className="text-neutral-400 hover:text-neutral-900"><X size={14} /></button>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    autoFocus
                                    value={newLessonTitle}
                                    onChange={e => setNewLessonTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateLesson()}
                                    placeholder="Titre de la leçon (ex: Les principes du contraste)"
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] shadow-sm transition-all"
                                />
                                <p className="text-[11px] text-neutral-400 mt-2 px-1 italic">
                                    💡 Vous pourrez ajouter la vidéo, les notes et les documents juste après avoir créé le titre.
                                </p>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={() => setIsAddingLesson(false)} className="text-[11px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors">Annuler</button>
                                    <button
                                        onClick={handleCreateLesson}
                                        disabled={!newLessonTitle.trim() || isCreatingLesson}
                                        className="px-4 py-2 bg-[#0A66C2] text-white rounded font-bold text-[11px] hover:bg-[#004182] shadow-md transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isCreatingLesson ? <Loader2 size={14} className="animate-spin" /> : 'Ajouter la leçon'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isAddingLesson && (!chapter.lessons || chapter.lessons.length === 0) && (
                        <p className="text-[11px] text-neutral-400 italic py-4 text-center">Aucune leçon dans ce chapitre.</p>
                    )}
                </div>
            )}
        </div>
    );
}

function LessonRow({ lesson, index, onEdit }: { lesson: any, index: number, onEdit: (lesson: any) => void }) {
    return (
        <div
            onClick={() => onEdit(lesson)}
            className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg group hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/[0.02] transition-all shadow-sm cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className="p-1 text-neutral-200 group-hover:text-neutral-400 transition-colors">
                    <GripVertical size={16} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 dark:bg-neutral-800 rounded-md">
                        {lesson.content_type === 'VIDEO' && <Video size={13} className="text-[#0A66C2]" />}
                        {lesson.content_type === 'TEXT' && <FileText size={13} className="text-emerald-500" />}
                        {lesson.content_type === 'DOCUMENT' && <Book size={13} className="text-orange-500" />}
                        {!lesson.content_type && <div className="w-2 h-2 rounded-full bg-neutral-200" />}
                    </div>
                    <span className="text-[12px] font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-[#0A66C2] transition-colors">
                        {index}. {lesson.title}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="p-1.5 text-neutral-400 hover:text-[#0A66C2] rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Edit2 size={13} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

// ── Form Sub-components ───────────────────────────────────────────────────────

function CourseDetailsForm({ formData, setFormData, categories }: { formData: any, setFormData: any, categories: any[] }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!formData) return null;

    const handleUpdate = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await learningsApi.uploadThumbnail(file);
            if (response.success) {
                handleUpdate('thumbnail_url', response.data.url);
            }
        } catch (error) {
            console.error("Upload thumbnail failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const addListItem = (field: 'learning_objectives' | 'requirements') => {
        handleUpdate(field, [...formData[field], '']);
    };

    const updateListItem = (field: 'learning_objectives' | 'requirements', index: number, value: string) => {
        const newList = [...formData[field]];
        newList[index] = value;
        handleUpdate(field, newList);
    };

    const removeListItem = (field: 'learning_objectives' | 'requirements', index: number) => {
        if (formData[field].length <= 1) return;
        const newList = formData[field].filter((_: any, i: number) => i !== index);
        handleUpdate(field, newList);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto lg:mx-0">
            {/* Thumbnail Upload Section */}
            <div className="space-y-2">
                <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Image de couverture</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Titre du cours</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleUpdate('title', e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-3 text-[14px] font-medium outline-none focus:border-[#0A66C2] transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Catégorie</label>
                    <select
                        value={formData.category_id}
                        onChange={(e) => handleUpdate('category_id', e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-3 text-[14px] font-medium outline-none focus:border-[#0A66C2] transition-all"
                    >
                        <option value="" disabled>Sélectionner une catégorie</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Prix (€)</label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleUpdate('price', e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-3 text-[14px] font-medium outline-none focus:border-[#0A66C2] transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Niveau</label>
                    <select
                        value={formData.level}
                        onChange={(e) => handleUpdate('level', e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-3 text-[14px] font-medium outline-none focus:border-[#0A66C2] transition-all"
                    >
                        <option value="BEGINNER">Débutant</option>
                        <option value="INTERMEDIATE">Intermédiaire</option>
                        <option value="ADVANCED">Avancé</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Description courte</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => handleUpdate('description', e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-3 text-[14px] font-medium outline-none focus:border-[#0A66C2] transition-all resize-none"
                    placeholder="Résumez votre cours en 1 ou 2 phrases."
                />
            </div>

            <div className="space-y-2">
                <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-widest">Description détaillée</label>
                <textarea
                    value={formData.long_description}
                    onChange={(e) => handleUpdate('long_description', e.target.value)}
                    rows={6}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-3 text-[14px] font-medium outline-none focus:border-[#0A66C2] transition-all resize-none"
                    placeholder="Détaillez le contenu, la méthode, etc."
                />
            </div>

            {/* Udemy Specific Fields */}
            <div className="space-y-8 pt-4">
                <div className="space-y-3">
                    <h3 className="text-[14px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#057642]" />
                        Ce que les élèves vont apprendre
                    </h3>
                    <div className="space-y-2">
                        {formData.learning_objectives.map((obj: string, i: number) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    value={obj}
                                    onChange={(e) => updateListItem('learning_objectives', i, e.target.value)}
                                    placeholder="Ex: Maîtriser les bases de React"
                                    className="flex-grow bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] transition-all"
                                />
                                <button
                                    onClick={() => removeListItem('learning_objectives', i)}
                                    type="button"
                                    className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem('learning_objectives')}
                            className="text-[#0A66C2] text-[12px] font-bold flex items-center gap-1 hover:underline mt-2"
                        >
                            <Plus size={14} /> Ajouter un objectif
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-[14px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Info size={16} className="text-neutral-400" />
                        Prérequis & Exigences
                    </h3>
                    <div className="space-y-2">
                        {formData.requirements.map((req: string, i: number) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    value={req}
                                    onChange={(e) => updateListItem('requirements', i, e.target.value)}
                                    placeholder="Ex: Connaissances de base en HTML/CSS"
                                    className="flex-grow bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeListItem('requirements', i)}
                                    className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem('requirements')}
                            className="text-[#0A66C2] text-[12px] font-bold flex items-center gap-1 hover:underline mt-2"
                        >
                            <Plus size={14} /> Ajouter une exigence
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Lesson Content Editor Modal ─────────────────────────────────────────────

function LessonContentEditor({ lesson, onClose }: { lesson: any, onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState(lesson.title);
    const [contentType, setContentType] = useState(lesson.content_type || 'VIDEO');
    const [contentText, setContentText] = useState(lesson.content_text || '');
    const [videoUrl, setVideoUrl] = useState(lesson.video_url || '');
    const [attachments, setAttachments] = useState<any[]>(lesson.attachments || []);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await dispatch(updateLessonThunk({
                id: lesson.id,
                dto: {
                    title,
                    content_type: contentType,
                    content_text: contentText,
                    video_url: videoUrl,
                    attachments
                }
            })).unwrap();
            onClose();
        } catch (error) {
            console.error('Failed to save lesson', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isVideo: boolean = false) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setUploadProgress(10);

            // 1. Get signature from backend
            const sig = await learningsApi.getUploadSignature(isVideo ? 'worknet/courses/videos' : 'worknet/courses/docs');
            setUploadProgress(30);

            // 2. Upload to Cloudinary directly
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', sig.apiKey);
            formData.append('timestamp', sig.timestamp.toString());
            formData.append('signature', sig.signature);
            formData.append('folder', sig.folder);

            const resourceType = isVideo ? 'video' : 'raw';
            const uploadRes = await fetch(
                `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!uploadRes.ok) throw new Error('Upload to Cloudinary failed');

            const uploadData = await uploadRes.json();
            setUploadProgress(100);

            if (isVideo) {
                setVideoUrl(uploadData.secure_url);
            } else {
                setAttachments([...attachments, {
                    title: file.name,
                    url: uploadData.secure_url,
                    type: file.type,
                    size: file.size
                }]);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert("Le téléchargement a échoué. Veuillez réessayer.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Edit2 size={20} className="text-[#0A66C2]" />
                            Modifier le contenu : {lesson.title}
                        </h2>
                        <p className="text-sm text-neutral-500 mt-1 font-medium">Configurez les médias et le texte de cette leçon.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* General Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 ml-1">Titre de la leçon</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0A66C2]/20 transition-all font-medium"
                                placeholder="ex: Introduction au module..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 ml-1">Type de contenu</label>
                            <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setContentType('VIDEO')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${contentType === 'VIDEO' ? 'bg-white dark:bg-neutral-700 text-[#0A66C2] shadow-md' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/50'}`}
                                >
                                    <Video size={16} /> Vidéo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContentType('TEXT')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${contentType === 'TEXT' ? 'bg-white dark:bg-neutral-700 text-emerald-600 shadow-md' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/50'}`}
                                >
                                    <FileText size={16} /> Texte
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContentType('DOCUMENT')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${contentType === 'DOCUMENT' ? 'bg-white dark:bg-neutral-700 text-orange-600 shadow-md' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200/50'}`}
                                >
                                    <Book size={16} /> Document
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-[16px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Layout size={18} className="text-[#0A66C2]" />
                                Contenu principal
                            </h3>
                        </div>

                        {contentType === 'VIDEO' && (
                            /* Video Upload Area */
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 ml-1 flex items-center gap-2">
                                        <Video size={14} className="text-[#0A66C2]" />
                                        Vidéo de la leçon
                                    </h4>
                                    {videoUrl && (
                                        <button
                                            onClick={() => setVideoUrl('')}
                                            className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Supprimer la vidéo
                                        </button>
                                    )}
                                </div>

                                {videoUrl ? (
                                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black ring-1 ring-neutral-200 dark:ring-neutral-800 group shadow-lg">
                                        <video
                                            src={videoUrl}
                                            controls
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => videoInputRef.current?.click()}
                                        className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 transition-all cursor-pointer group relative bg-neutral-50/30"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] group-hover:scale-110 transition-transform">
                                            <Upload size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">Télécharger la vidéo</p>
                                            <p className="text-[11px] text-neutral-500 mt-1 font-medium">MP4, WebM ou MOV (Max 500MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            ref={videoInputRef}
                                            onChange={(e) => handleFileUpload(e, true)}
                                            accept="video/*"
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {(contentType === 'TEXT' || contentType === 'VIDEO') && (
                            /* Text / Notes Area - Also available for video as description */
                            <div className="space-y-3 animate-in fade-in duration-500">
                                <h4 className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 ml-1 flex items-center gap-2">
                                    <FileText size={14} className="text-emerald-600" />
                                    {contentType === 'VIDEO' ? 'Description & Notes' : 'Contenu textuel de la leçon'}
                                </h4>
                                <textarea
                                    value={contentText}
                                    onChange={(e) => setContentText(e.target.value)}
                                    rows={contentType === 'VIDEO' ? 4 : 12}
                                    className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl text-[14px] leading-relaxed focus:ring-2 focus:ring-[#0A66C2]/20 transition-all font-medium min-h-[150px] shadow-inner"
                                    placeholder="Rédigez le contenu ici..."
                                />
                            </div>
                        )}

                        {contentType === 'DOCUMENT' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 ml-1 flex items-center gap-2">
                                        <Book size={14} className="text-orange-500" />
                                        Document principal (PDF, Slide, etc.)
                                    </h4>
                                </div>

                                {attachments.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {attachments.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700/50 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-white dark:bg-neutral-700 rounded-lg text-orange-500 shadow-sm">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-neutral-900 dark:text-white truncate">{file.title}</p>
                                                        <p className="text-[11px] text-neutral-500 font-medium">Document joint</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeAttachment(idx)}
                                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => docInputRef.current?.click()}
                                        className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer group relative bg-neutral-50/30"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                            <Upload size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">Ajouter le document</p>
                                            <p className="text-[11px] text-neutral-500 mt-1 font-medium">PDF, DOCX, ZIP (Max 50MB)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Supplemental Resources (Optional for all) */}
                    {contentType !== 'DOCUMENT' && (
                        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[15px] font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Book size={18} className="text-[#0A66C2]" />
                                    Ressources complémentaires ({attachments.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => docInputRef.current?.click()}
                                    className="flex items-center gap-2 text-xs font-extrabold text-[#0A66C2] hover:underline bg-[#0A66C2]/5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                    <Plus size={14} /> Ajouter un fichier
                                </button>
                            </div>

                            {attachments.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700/50 group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-neutral-700 rounded-lg text-neutral-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="max-w-[180px]">
                                                    <p className="text-[12px] font-bold text-neutral-900 dark:text-white truncate">{file.title}</p>
                                                    <p className="text-[10px] text-neutral-500 font-medium">Fichier joint</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeAttachment(idx)}
                                                className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {isUploading && (
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin text-[#0A66C2]" size={16} />
                                <div className="w-32 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#0A66C2] transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <span className="text-[11px] font-bold text-[#0A66C2]">{uploadProgress}%</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isUploading || isSaving || !title}
                            className="flex items-center gap-2 px-8 py-2.5 bg-[#0A66C2] text-white rounded-xl text-sm font-extrabold hover:bg-[#004182] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                            Enregistrer le contenu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
