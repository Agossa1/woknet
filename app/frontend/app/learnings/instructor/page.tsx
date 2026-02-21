"use client";

import React, { useEffect, useState } from 'react';
import {
    GraduationCap, Plus, Star, Users, DollarSign, BookOpen,
    ArrowLeft, TrendingUp, Edit, Eye, LayoutDashboard,
    ChevronRight, BadgeCheck, BarChart2, Loader2,
    ShieldCheck, AlertTriangle, MapPin, Briefcase, Mail,
    Settings, ExternalLink, CheckCircle2, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { getInstructorDashboardThunk } from '@/src/features/learnings/services/learnings-thunks';
import { selectInstructorCourses, selectLearningsLoading } from '@/src/features/learnings/services/learnings-selectors';
import { InstructorCourse } from '@/src/features/learnings/services/learnings-types';
import { useRequireInstructor } from '@/src/hooks/useRequireAuth';
import { useRouter } from 'next/navigation';

const iconStroke = 1.25;

const statusConfig = {
    PUBLISHED: { label: 'Publié', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' },
    DRAFT: { label: 'Brouillon', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
    ARCHIVED: { label: 'Archivé', color: 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700' },
} as const;

// ── Sub-components ─────────────────────────────────────────────────────────────

function CourseRow({ course }: { course: InstructorCourse }) {
    const status = statusConfig[course.status as keyof typeof statusConfig] ?? statusConfig.DRAFT;
    return (
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-[#0A66C2]/40 hover:shadow-sm transition-all group">
            {/* Thumbnail */}
            <div className="w-14 h-10 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 border border-neutral-100 dark:border-neutral-700">
                {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} strokeWidth={iconStroke} className="text-neutral-300" /></div>
                }
            </div>

            {/* Title + meta */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-neutral-900 dark:text-white truncate group-hover:text-[#0A66C2] transition-colors font-inter">
                        {course.title}
                    </span>
                    <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${status.color}`}>
                        {status.label}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-neutral-400">
                    <span className="flex items-center gap-1"><BookOpen size={10} strokeWidth={iconStroke} />{course.chapter_count} modules</span>
                    <span className="flex items-center gap-1"><Users size={10} strokeWidth={iconStroke} />{course.total_students}</span>
                    {Number(course.avg_rating) > 0 && (
                        <span className="flex items-center gap-1 text-amber-500"><Star size={10} className="fill-current" />{Number(course.avg_rating).toFixed(1)}</span>
                    )}
                </div>
            </div>

            {/* Revenue */}
            <div className="text-right flex-shrink-0 hidden md:block">
                <div className="text-[14px] font-bold text-neutral-900 dark:text-white font-inter">€{Number(course.total_revenue).toFixed(0)}</div>
                <div className="text-[10px] text-neutral-400 font-medium">revenus</div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <Link href={`/learnings/${course.slug}`} className="p-1.5 rounded text-neutral-300 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all" title="Voir">
                    <Eye size={15} strokeWidth={iconStroke} />
                </Link>
                <Link href={`/learnings/instructor/edit/${course.id}`} className="p-1.5 rounded text-neutral-300 hover:text-[#0A66C2] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all" title="Modifier">
                    <Edit size={15} strokeWidth={iconStroke} />
                </Link>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub, accent = false }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: boolean }) {
    return (
        <div className={`rounded-lg p-4 border ${accent ? 'bg-[#0A66C2] border-[#004182] text-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-blue-200' : 'text-neutral-400'}`}>{label}</span>
                <div className={`w-7 h-7 rounded flex items-center justify-center ${accent ? 'bg-white/10' : 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700'}`}>
                    <span className={accent ? 'text-white' : 'text-neutral-400'}>{icon}</span>
                </div>
            </div>
            <div className={`text-[22px] font-bold font-inter tracking-tight leading-none ${accent ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>{value}</div>
            {sub && <div className={`text-[10px] font-medium mt-1 ${accent ? 'text-blue-200' : 'text-neutral-400'}`}>{sub}</div>}
        </div>
    );
}

// ── Guard screens ──────────────────────────────────────────────────────────────
function GuardScreen({ notInstructor }: { notInstructor?: boolean }) {
    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center justify-center gap-5 px-6 font-sans">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <ShieldCheck size={26} className="text-red-500" strokeWidth={iconStroke} />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-inter text-center">
                {notInstructor ? 'Espace non activé' : 'Connexion requise'}
            </h2>
            <p className="text-[13px] text-neutral-500 text-center max-w-sm font-medium leading-relaxed">
                {notInstructor
                    ? "Soumettez votre candidature pour accéder à votre espace formateur."
                    : "Vous devez être connecté pour accéder à cette page."}
            </p>
            <Link href={notInstructor ? '/learnings/instructor/apply' : '/signin'}
                className="bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2.5 rounded text-sm font-semibold transition-all shadow-sm">
                {notInstructor ? 'Créer mon espace' : 'Se connecter'}
            </Link>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function InstructorDashboardPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, isInstructor, user } = useRequireInstructor();
    const courses = useAppSelector(selectInstructorCourses);
    const isLoading = useAppSelector(selectLearningsLoading);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'analytics'>('overview');

    useEffect(() => {
        if (isAuthenticated && isInstructor) dispatch(getInstructorDashboardThunk());
    }, [dispatch, isAuthenticated, isInstructor]);

    if (authLoading) return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-neutral-300" strokeWidth={iconStroke} />
        </div>
    );
    if (!isAuthenticated) return <GuardScreen />;
    if (!isInstructor) return <GuardScreen notInstructor />;

    // Computed
    const totalStudents = courses.reduce((s, c) => s + (c.total_students || 0), 0);
    const totalRevenue = courses.reduce((s, c) => s + (c.total_revenue || 0), 0);
    const ratedCourses = courses.filter(c => Number(c.avg_rating) > 0);
    const avgRating = ratedCourses.length ? ratedCourses.reduce((s, c) => s + Number(c.avg_rating), 0) / ratedCourses.length : 0;
    const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
    const draftCount = courses.filter(c => c.status === 'DRAFT').length;
    const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans antialiased">

            {/* ── Top bar ──────────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 h-14 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link href="/learnings" className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        <ArrowLeft size={13} strokeWidth={iconStroke} /> Marketplace
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-neutral-900 dark:bg-white rounded flex items-center justify-center">
                            <GraduationCap size={14} className="text-white dark:text-neutral-900" strokeWidth={iconStroke} />
                        </div>
                        <span className="font-semibold text-[14px] text-neutral-900 dark:text-white font-inter">Espace Formateur</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 rounded-full bg-neutral-50 dark:bg-neutral-800 text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {initials} · Espace sécurisé
                    </div>
                    <button onClick={() => router.push('/learnings?create=true')}
                        className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 rounded font-semibold text-[13px] transition-all shadow-sm">
                        <Plus size={15} strokeWidth={2.5} /> Nouvelle formation
                    </button>
                </div>
            </div>

            {/* ── Body: sidebar + main ──────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto flex gap-6 p-6 md:p-8 items-start">

                {/* ════ LEFT SIDEBAR ════════════════════════════════════════════ */}
                <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0 sticky top-20">

                    {/* Profile card */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                        {/* Cover */}
                        <div className="h-14 bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700" />
                        <div className="px-5 pb-5">
                            {/* Avatar */}
                            <div className="-mt-8 mb-3 w-16 h-16 rounded-lg border-4 border-white dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold text-neutral-500 shadow-sm">
                                {initials}
                            </div>
                            <div className="flex items-start justify-between mb-1">
                                <div>
                                    <h2 className="text-[14px] font-bold text-neutral-900 dark:text-white font-inter leading-tight">
                                        {user?.full_name ?? 'Formateur'}
                                    </h2>
                                    {user?.job_title && (
                                        <p className="text-[11px] text-neutral-500 font-medium">{user.job_title}</p>
                                    )}
                                </div>
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex-shrink-0">
                                    <BadgeCheck size={9} /> Pro
                                </span>
                            </div>

                            {user?.headline && (
                                <p className="text-[11px] text-neutral-500 font-medium mb-3 leading-relaxed">{user.headline}</p>
                            )}

                            <div className="space-y-1.5 mb-4">
                                {user?.email && (
                                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                                        <Mail size={11} strokeWidth={iconStroke} className="flex-shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                )}
                                {(user?.city || user?.country) && (
                                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                                        <MapPin size={11} strokeWidth={iconStroke} className="flex-shrink-0" />
                                        {[user.city, user.country].filter(Boolean).join(', ')}
                                    </div>
                                )}
                            </div>

                            <Link href="/profile"
                                className="w-full flex items-center justify-center gap-1.5 border border-neutral-200 dark:border-neutral-700 rounded text-[12px] font-semibold text-neutral-600 dark:text-neutral-300 py-2 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-colors">
                                <Edit size={12} strokeWidth={iconStroke} /> Modifier le profil
                            </Link>
                        </div>
                    </div>

                    {/* Security status */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                        <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Sécurité</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
                                    {user?.is_verified
                                        ? <CheckCircle2 size={13} className="text-emerald-500" />
                                        : <XCircle size={13} className="text-red-400" />
                                    }
                                    Compte vérifié
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-[12px] font-medium text-neutral-600 dark:text-neutral-400">
                                    {user?.two_factor_enabled
                                        ? <CheckCircle2 size={13} className="text-emerald-500" />
                                        : <XCircle size={13} className="text-amber-400" />
                                    }
                                    Double auth. (2FA)
                                </span>
                                {!user?.two_factor_enabled && (
                                    <Link href="/settings/security" className="text-[10px] font-bold text-[#0A66C2] hover:underline">Activer</Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick nav */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm">
                        <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Navigation</h3>
                        <nav className="space-y-1">
                            {[
                                { icon: <LayoutDashboard size={14} strokeWidth={iconStroke} />, label: "Vue d'ensemble", key: 'overview' as const },
                                { icon: <BookOpen size={14} strokeWidth={iconStroke} />, label: 'Mes formations', key: 'courses' as const },
                                { icon: <BarChart2 size={14} strokeWidth={iconStroke} />, label: 'Analytiques', key: 'analytics' as const },
                            ].map(item => (
                                <button key={item.key} onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors text-left ${activeTab === item.key
                                        ? 'bg-[#0A66C2]/8 text-[#0A66C2] dark:bg-[#0A66C2]/15'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                        }`}>
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* ════ MAIN CONTENT ════════════════════════════════════════════ */}
                <main className="flex-grow min-w-0 space-y-5">

                    {/* Mobile tabs (visible only on small screens) */}
                    <div className="flex lg:hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                        {([
                            { key: 'overview', label: 'Aperçu', icon: <LayoutDashboard size={14} strokeWidth={iconStroke} /> },
                            { key: 'courses', label: 'Formations', icon: <BookOpen size={14} strokeWidth={iconStroke} /> },
                            { key: 'analytics', label: 'Stats', icon: <BarChart2 size={14} strokeWidth={iconStroke} /> },
                        ] as const).map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#0A66C2] text-[#0A66C2]' : 'border-transparent text-neutral-500'}`}>
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 size={24} className="animate-spin text-neutral-300" strokeWidth={iconStroke} />
                        </div>
                    ) : (
                        <>
                            {/* ── OVERVIEW ────────────────────────────────────────────── */}
                            {activeTab === 'overview' && (
                                <div className="space-y-5">
                                    {/* 2FA warning */}
                                    {!user?.two_factor_enabled && (
                                        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                            <AlertTriangle size={16} strokeWidth={iconStroke} className="text-amber-500 flex-shrink-0" />
                                            <div className="flex-grow min-w-0">
                                                <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">Double authentification non activée</p>
                                                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Activez la 2FA pour sécuriser vos revenus et votre espace.</p>
                                            </div>
                                            <Link href="/settings/security"
                                                className="flex-shrink-0 text-[11px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors whitespace-nowrap">
                                                Activer 2FA
                                            </Link>
                                        </div>
                                    )}

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                                        <StatCard icon={<BookOpen size={14} strokeWidth={iconStroke} />} label="Formations" value={courses.length} sub={`${publishedCount} pub. · ${draftCount} brouillons`} accent />
                                        <StatCard icon={<Users size={14} strokeWidth={iconStroke} />} label="Apprenants" value={totalStudents} sub="inscrits au total" />
                                        <StatCard icon={<DollarSign size={14} strokeWidth={iconStroke} />} label="Revenus" value={`€${totalRevenue.toFixed(0)}`} sub="complétés" />
                                        <StatCard icon={<Star size={14} strokeWidth={iconStroke} />} label="Note moy." value={avgRating > 0 ? avgRating.toFixed(1) + ' ★' : '–'} sub={avgRating > 0 ? 'sur 5 étoiles' : 'Aucun avis'} />
                                    </div>

                                    {/* Courses section */}
                                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                                            <h2 className="text-[14px] font-semibold text-neutral-900 dark:text-white font-inter">
                                                Formations récentes
                                                {courses.length > 0 && <span className="ml-2 text-[11px] font-normal text-neutral-400">({courses.length})</span>}
                                            </h2>
                                            {courses.length > 3 && (
                                                <button onClick={() => setActiveTab('courses')}
                                                    className="flex items-center gap-1 text-[12px] font-semibold text-[#0A66C2] hover:underline">
                                                    Tout voir <ChevronRight size={13} strokeWidth={iconStroke} />
                                                </button>
                                            )}
                                        </div>

                                        {courses.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                                                <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-4 border border-neutral-100 dark:border-neutral-700">
                                                    <GraduationCap size={22} strokeWidth={1} className="text-neutral-300" />
                                                </div>
                                                <p className="text-[14px] font-semibold text-neutral-900 dark:text-white mb-1 font-inter">Aucune formation créée</p>
                                                <p className="text-[12px] text-neutral-400 font-medium mb-5 max-w-xs">Créez votre première formation pour partager votre expertise.</p>
                                                <button onClick={() => router.push('/learnings?create=true')}
                                                    className="bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-all shadow-sm">
                                                    + Créer une formation
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                                {courses.slice(0, 5).map(c => (
                                                    <div key={c.id} className="px-5 py-1">
                                                        <CourseRow course={c} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── COURSES ─────────────────────────────────────────────── */}
                            {activeTab === 'courses' && (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                                        <div>
                                            <h2 className="text-[14px] font-semibold text-neutral-900 dark:text-white font-inter">Mes formations</h2>
                                            <p className="text-[11px] text-neutral-400 font-medium">{publishedCount} publiées · {draftCount} brouillons</p>
                                        </div>
                                        <button onClick={() => router.push('/learnings?create=true')}
                                            className="flex items-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white px-3 py-2 rounded-lg text-[12px] font-semibold transition-all shadow-sm">
                                            <Plus size={13} strokeWidth={2.5} /> Nouvelle
                                        </button>
                                    </div>

                                    {courses.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <BookOpen size={32} strokeWidth={1} className="text-neutral-200 dark:text-neutral-700 mb-3" />
                                            <p className="text-[13px] font-semibold text-neutral-500">Aucune formation pour le moment</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                            {courses.map(c => (
                                                <div key={c.id} className="px-5 py-1">
                                                    <CourseRow course={c} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ANALYTICS ───────────────────────────────────────────── */}
                            {activeTab === 'analytics' && (
                                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
                                    <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                                        <h2 className="text-[14px] font-semibold text-neutral-900 dark:text-white font-inter">Analytiques</h2>
                                        <p className="text-[11px] text-neutral-400 font-medium">Performances de vos formations</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <BarChart2 size={36} strokeWidth={1} className="text-neutral-200 dark:text-neutral-700 mb-4" />
                                        <p className="text-[14px] font-semibold text-neutral-500 font-inter mb-1">Analytiques avancées</p>
                                        <p className="text-[12px] text-neutral-400 font-medium max-w-xs">Les graphiques détaillés et rapports seront disponibles prochainement.</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
