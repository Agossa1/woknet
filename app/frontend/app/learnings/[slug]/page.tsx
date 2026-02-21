"use client";

import React, { useEffect } from 'react';
import { PlayCircle, Clock, Star, CheckCircle, Trophy, ArrowLeft, ShieldCheck, HelpCircle, Loader2, AlertCircle, ChevronDown, FileText, Users, Book, Circle } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
    getCourseBySlugThunk,
    getChaptersByCourseIdThunk,
    getCourseReviewsThunk,
    enrollUserThunk,
    getUserDashboardThunk,
} from '@/src/features/learnings/services/learnings-thunks';
import {
    selectCurrentCourse,
    selectCurrentChapters,
    selectCurrentReviews,
    selectLearningsLoading,
    selectEnrolling,
    selectIsEnrolled,
} from '@/src/features/learnings/services/learnings-selectors';
import { clearCurrentCourse } from '@/src/features/learnings/services/learnings-slice';

const iconStroke = 1.25;

export default function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params);
    const dispatch = useAppDispatch();
    const course = useAppSelector(selectCurrentCourse);
    const chapters = useAppSelector(selectCurrentChapters);
    const reviews = useAppSelector(selectCurrentReviews);
    const isLoading = useAppSelector(selectLearningsLoading);
    const isEnrolling = useAppSelector(selectEnrolling);
    const isEnrolled = useAppSelector(selectIsEnrolled(course?.id ?? ''));

    useEffect(() => {
        dispatch(getCourseBySlugThunk(slug));
        dispatch(getUserDashboardThunk());
        return () => {
            dispatch(clearCurrentCourse());
        };
    }, [dispatch, slug]);

    useEffect(() => {
        if (course?.id) {
            dispatch(getChaptersByCourseIdThunk(course.id));
            dispatch(getCourseReviewsThunk(course.id));
        }
    }, [dispatch, course?.id]);

    const handleEnroll = () => {
        if (!course) return;
        dispatch(enrollUserThunk({ course_id: course.id, amount_paid: Number(course.price) }));
    };

    const levelLabel = course?.level === 'BEGINNER' ? 'Débutant' : course?.level === 'INTERMEDIATE' ? 'Intermédiaire' : 'Avancé';

    if (isLoading && !course) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-neutral-400" strokeWidth={iconStroke} />
            </div>
        );
    }

    if (!isLoading && !course) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center justify-center gap-4">
                <AlertCircle size={40} className="text-neutral-300" strokeWidth={1} />
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-inter">Formation introuvable</h2>
                <Link href="/learnings" className="text-sm font-semibold text-[#0A66C2] hover:underline inline-flex items-center gap-2">
                    <ArrowLeft size={14} /> Retour aux formations
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black p-6 md:p-10 font-sans antialiased text-neutral-800">
            <div className="max-w-5xl mx-auto w-full">

                {/* Back Link */}
                <Link
                    href="/learnings"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6"
                >
                    <ArrowLeft size={14} />
                    <span>Retour aux formations</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Course Header Box */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm">
                            <div className="aspect-[21/9] relative bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800 group overflow-hidden">
                                {course?.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                        <PlayCircle size={40} strokeWidth={iconStroke} className="text-neutral-300" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 transition-colors flex items-center justify-center cursor-pointer">
                                    <div className="w-14 h-14 bg-white/95 backdrop-blur rounded flex items-center justify-center text-neutral-900 shadow-md transform hover:scale-105 transition-transform">
                                        <PlayCircle size={28} strokeWidth={iconStroke} className="ml-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    {course?.category && (
                                        <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider rounded border border-neutral-200 dark:border-neutral-700">
                                            {course.category}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{levelLabel}</span>
                                    {course?.avg_rating && (
                                        <div className="flex items-center gap-1 text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
                                            <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                            <span>{Number(course.avg_rating || 0).toFixed(1)}</span>
                                            <span className="text-neutral-400 font-medium">({course.review_count || 0} avis)</span>
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 font-inter tracking-tight">
                                    {course?.title}
                                </h1>

                                <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-6">
                                    {course?.description || 'Formation professionnelle animée par des experts de l\'industrie.'}
                                </p>

                                <div className="flex flex-wrap items-center gap-6 text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} strokeWidth={iconStroke} className="text-neutral-400" />
                                        <span>Créé par <span className="text-[#0A66C2]">{course?.author_name || (course as any).author?.full_name || 'Instructeur'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} strokeWidth={iconStroke} className="text-neutral-400" />
                                        <span>Dernière mise à jour {new Date(course?.updated_at || Date.now()).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>

                                {/* Learning Objectives Box */}
                                {course?.learning_objectives && course.learning_objectives.length > 0 && (
                                    <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 rounded-xl p-6 mb-8 mt-8">
                                        <h3 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4 font-inter">Ce que vous allez apprendre</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                            {course.learning_objectives.map((obj, i) => (
                                                <div key={i} className="flex items-start gap-3 text-[13px] text-neutral-600 dark:text-neutral-400 font-medium">
                                                    <CheckCircle size={16} className="text-[#057642] mt-0.5 flex-shrink-0" strokeWidth={2} />
                                                    <span>{obj}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-6 text-[13px] font-semibold text-neutral-700 dark:text-neutral-300 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <Trophy size={16} strokeWidth={iconStroke} className="text-neutral-400" />
                                        <span>Certificat de réussite</span>
                                    </div>
                                    {course?.enrollment_count !== undefined && (
                                        <div className="flex items-center gap-2">
                                            <Users size={16} strokeWidth={iconStroke} className="text-neutral-400" />
                                            <span>{course.enrollment_count} inscrits</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Description */}
                        {course?.long_description && (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 shadow-sm">
                                <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-4 font-inter tracking-tight">Description</h2>
                                <div className="text-[14px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium whitespace-pre-wrap">
                                    {course.long_description}
                                </div>
                            </div>
                        )}

                        {/* Requirements */}
                        {course?.requirements && (course.requirements as any).length > 0 && (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 shadow-sm">
                                <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-4 font-inter tracking-tight">Prérequis</h2>
                                <ul className="space-y-2">
                                    {(course.requirements as string[]).map((req, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[13px] text-neutral-600 dark:text-neutral-400 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 flex-shrink-0" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Curriculum / Course Content */}
                        {chapters && chapters.length > 0 && (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-[19px] font-bold text-[#2D2F31] mb-2 font-inter tracking-tight">Programme de la formation</h2>
                                        <div className="flex items-center gap-2 text-[14px] font-normal text-[#2D2F31]">
                                            <span>{chapters.length} sections</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                            <span>{chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0)} lectures</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                            <span>Durée totale : {Math.floor(chapters.reduce((acc, ch) => acc + (ch.lessons?.reduce((lAcc, l) => lAcc + l.duration_minutes, 0) || 0), 0) / 60)}h {chapters.reduce((acc, ch) => acc + (ch.lessons?.reduce((lAcc, l) => lAcc + l.duration_minutes, 0) || 0), 0) % 60}min</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const allExpanded = chapters.every((_, i) => (document.getElementById(`chapter-content-${i}`)?.classList.contains('block')));
                                            chapters.forEach((_, i) => {
                                                const el = document.getElementById(`chapter-content-${i}`);
                                                const icon = document.getElementById(`chapter-icon-${i}`);
                                                if (allExpanded) {
                                                    el?.classList.replace('block', 'hidden');
                                                    icon?.classList.remove('rotate-180');
                                                } else {
                                                    el?.classList.replace('hidden', 'block');
                                                    icon?.classList.add('rotate-180');
                                                }
                                            });
                                        }}
                                        className="text-[13px] font-bold text-[#0A66C2] hover:text-[#004182] transition-colors"
                                    >
                                        Tout déplier/replier
                                    </button>
                                </div>

                                <div className="border border-[#D1D7DC] rounded-sm overflow-hidden bg-white">
                                    {chapters.map((chapter, i) => (
                                        <div key={chapter.id} className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
                                            <button
                                                onClick={() => {
                                                    const content = document.getElementById(`chapter-content-${i}`);
                                                    const icon = document.getElementById(`chapter-icon-${i}`);
                                                    if (content?.classList.contains('hidden')) {
                                                        content.classList.replace('hidden', 'block');
                                                        icon?.classList.add('rotate-180');
                                                    } else {
                                                        content?.classList.replace('block', 'hidden');
                                                        icon?.classList.remove('rotate-180');
                                                    }
                                                }}
                                                className="w-full flex items-center justify-between p-4 bg-[#F7F9FA] hover:bg-[#EBEEF0] transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ChevronDown id={`chapter-icon-${i}`} size={16} className="text-[#2D2F31] transition-transform duration-300" />
                                                    <span className="font-bold text-[14px] text-[#2D2F31]">
                                                        {chapter.title}
                                                    </span>
                                                </div>
                                                <div className="text-[12px] text-[#2D2F31] font-normal">
                                                    {chapter.lessons?.length || 0} lectures • {chapter.lessons?.reduce((acc, l) => acc + l.duration_minutes, 0) || 0}min
                                                </div>
                                            </button>

                                            <div id={`chapter-content-${i}`} className="hidden bg-white overflow-hidden">
                                                {chapter.lessons && chapter.lessons.length > 0 ? (
                                                    <div className="divide-y divide-neutral-100">
                                                        {chapter.lessons.map((lesson, j) => (
                                                            <div key={lesson.id} className="flex items-center justify-between p-3.5 hover:bg-neutral-50/50 transition-colors group">
                                                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                                    <div className="flex items-center justify-center shrink-0 w-4">
                                                                        {lesson.content_type === 'VIDEO' ? (
                                                                            <PlayCircle size={14} className="text-[#6A6F73]" />
                                                                        ) : lesson.content_type === 'DOCUMENT' ? (
                                                                            <Book size={14} className="text-[#6A6F73]" />
                                                                        ) : (
                                                                            <FileText size={14} className="text-[#6A6F73]" />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[14px] text-[#2D2F31] font-normal group-hover:text-[#0A66C2] transition-colors truncate">
                                                                        {lesson.title}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-5 shrink-0 ml-4">
                                                                    {lesson.is_free_preview && (
                                                                        <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#5624D0] underline hover:text-[#401B9C] transition-colors">
                                                                            <PlayCircle size={14} className="fill-[#5624D0] text-white" strokeWidth={2.5} />
                                                                            Preview
                                                                        </button>
                                                                    )}
                                                                    <span className="text-[14px] text-[#6A6F73] font-normal min-w-[35px] text-right">
                                                                        {lesson.duration_minutes}:00
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 pl-12 text-[13px] text-neutral-500 italic">
                                                        Aucune leçon dans ce chapitre.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 shadow-sm">
                                <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-white mb-6 font-inter tracking-tight">Avis des apprenants</h2>
                                <div className="space-y-4">
                                    {reviews.slice(0, 3).map(review => (
                                        <div key={review.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {review.reviewer_avatar && (
                                                    <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-700" />
                                                )}
                                                <div>
                                                    <div className="text-[13px] font-semibold text-neutral-800 dark:text-white">{review.reviewer_name || 'Apprenant'}</div>
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} size={12} className={i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-300'} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-[12px] text-neutral-500 font-medium italic">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sticky Sidebar */}
                    <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">

                        {/* Enroll / Buy Card */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
                            <div className="flex items-end justify-between mb-6">
                                <span className="text-[26px] font-bold text-neutral-900 dark:text-white tracking-tight leading-none">
                                    {Number(course?.price) === 0 ? 'Gratuit' : `€${Number(course?.price).toFixed(2)}`}
                                </span>
                            </div>

                            {isEnrolled ? (
                                <div className="w-full flex items-center justify-center gap-2 py-3 bg-[#057642] text-white rounded text-sm font-semibold shadow-sm">
                                    <CheckCircle size={16} />
                                    Inscrit avec succès
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isEnrolling ? (
                                        <><Loader2 size={16} className="animate-spin" /> Inscription...</>
                                    ) : "S'inscrire maintenant"}
                                </button>
                            )}

                            <div className="text-center text-[11px] font-semibold text-neutral-500 flex justify-center items-center gap-1.5 uppercase tracking-wide mt-4">
                                <ShieldCheck size={14} className="text-[#057642]" />
                                Satisfait ou remboursé sous 30 jours
                            </div>
                        </div>

                        {/* Instructor Card */}
                        {course?.author_name && (
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
                                <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white mb-4 uppercase tracking-tight">Votre instructeur</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    {course.author_avatar && (
                                        <img src={course.author_avatar} alt={course.author_name} className="w-12 h-12 rounded grayscale border border-neutral-200 dark:border-neutral-700 hover:grayscale-0 transition-all" />
                                    )}
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-semibold text-neutral-900 dark:text-white truncate">{course.author_name}</h4>
                                        <p className="text-[12px] font-medium text-neutral-500">Formateur certifié</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Help Box */}
                        <div className="flex items-start gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 shadow-sm">
                            <HelpCircle size={18} strokeWidth={iconStroke} className="text-neutral-500 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white mb-1">Des questions ?</h4>
                                <p className="text-[11px] font-medium text-neutral-500">
                                    Contactez notre support disponible 7j/7 pour vous accompagner.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
