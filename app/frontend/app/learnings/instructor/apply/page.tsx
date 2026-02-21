"use client";

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, GraduationCap, Users, DollarSign, Star,
    Check, ChevronDown, Loader2, PlayCircle, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { useRequireAuth } from '@/src/hooks/useRequireAuth';
import { becomeInstructorThunk } from '@/src/features/learnings/services/learnings-thunks';

const iconStroke = 1.25;

const EXPERTISE_DOMAINS = [
    'Design & UX', 'Développement Web', 'Marketing Digital', 'Data & IA',
    'Finance & Comptabilité', 'Entrepreneuriat', 'Leadership & Management',
    'Photographie & Vidéo', 'Langues', 'Autre',
];

const LANGUAGES = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Allemand', 'Portugais'];

const AUDIENCE_SIZES = [
    '0 – 1 000', '1 000 – 5 000', '5 000 – 15 000', '15 000 – 50 000', '50 000+',
];

const TESTIMONIALS = [
    {
        quote: "En tant que formateur, je partage mon expertise et génère des revenus tout en aidant des centaines de professionnels à évoluer.",
        author: "Marie Lambert",
        role: "Experte Marketing Digital • 1 245 apprenants",
        avatar: "https://i.pravatar.cc/150?u=marie",
    },
    {
        quote: "WorkNet m'a permis de monétiser mes compétences de manière simple et professionnelle. La plateforme est intuitive et bien pensée.",
        author: "Thomas Martin",
        role: "Lead Developer • 892 apprenants",
        avatar: "https://i.pravatar.cc/150?u=thomas",
    },
];

function CheckItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <div className="mt-0.5 w-5 h-5 bg-[#0A66C2]/10 rounded flex items-center justify-center flex-shrink-0">
                <Check size={12} strokeWidth={2.5} className="text-[#0A66C2]" />
            </div>
            <span className="text-[13px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">{text}</span>
        </li>
    );
}

export default function InstructorApplyPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
    const user = useAppSelector(selectAuthUser);
    const [step, setStep] = useState<1 | 2>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Split full_name into first / last for convenience
    const firstNameFromAuth = user?.full_name?.split(' ')[0] ?? '';
    const lastNameFromAuth = user?.full_name?.split(' ').slice(1).join(' ') ?? '';

    const [form, setForm] = useState({
        // Step 1 — Profil (pre-filled from auth)
        firstName: firstNameFromAuth,
        lastName: lastNameFromAuth,
        email: user?.email ?? '',
        audienceSize: '',
        domains: [] as string[],
        languages: [] as string[],

        // Step 2 — Expertise
        expertiseTopics: '',
        courseIdea: '',
        motivation: '',
        sampleVideoUrl: '',
        acceptTerms: false,
    });

    const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

    const toggleList = (field: 'domains' | 'languages', value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await dispatch(becomeInstructorThunk({
            headline: form.firstName + ' ' + form.lastName,
            expertiseTopics: form.expertiseTopics,
            courseIdea: form.courseIdea,
            motivation: form.motivation,
            sampleVideoUrl: form.sampleVideoUrl,
            audienceSize: form.audienceSize,
            domains: form.domains,
            languages: form.languages,
        }));

        setIsSubmitting(false);

        if (becomeInstructorThunk.fulfilled.match(result)) {
            setSubmitted(true);
            // is_instructor is now true in Redux (authSlice handles it)
            setTimeout(() => router.push('/learnings/instructor'), 2500);
        }
        // On rejection, keep form visible — error will surface via Redux or a local state
    };

    // ── Auth loading ──────────────────────────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-neutral-400" strokeWidth={1.25} />
            </div>
        );
    }

    // ── Not authenticated ──────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center justify-center gap-5 px-6">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <ShieldCheck size={26} className="text-red-500" strokeWidth={1.25} />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-inter text-center">
                    Connexion requise
                </h2>
                <p className="text-[13px] text-neutral-500 font-medium text-center max-w-sm leading-relaxed">
                    Vous devez être connecté pour soumettre une candidature formateur.
                </p>
                <Link
                    href="/signin"
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2.5 rounded text-sm font-semibold transition-all shadow-sm"
                >
                    Se connecter
                </Link>
            </div>
        );
    }

    // ── Success screen ─────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center justify-center gap-5 px-6 font-sans">
                <div className="w-16 h-16 bg-[#057642] rounded-full flex items-center justify-center shadow-lg">
                    <Check size={30} strokeWidth={2} className="text-white" />
                </div>
                <h2 className="text-[22px] font-bold text-neutral-900 dark:text-white font-inter text-center">
                    Candidature envoyée !
                </h2>
                <p className="text-[14px] text-neutral-500 font-medium text-center max-w-sm leading-relaxed">
                    Votre espace formateur est en cours de configuration. Vous serez redirigé vers votre tableau de bord dans quelques secondes…
                </p>
                <Loader2 size={20} className="animate-spin text-neutral-400" strokeWidth={iconStroke} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans antialiased">

            {/* Top bar */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 md:px-10 h-14 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <Link
                    href="/learnings"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={13} strokeWidth={iconStroke} />
                    Retour aux formations
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-neutral-900 dark:bg-white rounded flex items-center justify-center">
                        <GraduationCap size={14} className="text-white dark:text-neutral-900" strokeWidth={iconStroke} />
                    </div>
                    <span className="font-semibold text-sm text-neutral-800 dark:text-white font-inter">WorkNet Academy</span>
                </div>
            </div>

            {/* Main Layout */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-56px)]">

                {/* ── LEFT: Marketing pitch ──────────────────────────────────────────── */}
                <div className="p-10 md:p-16 lg:p-20 flex flex-col justify-center gap-8 lg:border-r border-neutral-200 dark:border-neutral-800">
                    <div>
                        <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#0A66C2] bg-[#0A66C2]/10 rounded mb-4">
                            Programme Formateur
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white font-inter leading-tight mb-4">
                            Devenez Formateur<br />sur WorkNet Academy
                        </h1>
                        <p className="text-[14px] text-neutral-500 font-medium leading-relaxed">
                            Rejoignez une communauté d'experts et partagez votre savoir avec des milliers de professionnels. Nous vous accompagnons à chaque étape.
                        </p>
                    </div>

                    <ul className="space-y-3">
                        <CheckItem text="Accédez à une base d'apprenants qualifiés et engagés" />
                        <CheckItem text="Fixez librement vos tarifs et monétisez votre expertise" />
                        <CheckItem text="Obtenez le badge 'Formateur Vérifié' pour renforcer votre crédibilité" />
                        <CheckItem text="Accédez à des outils analytiques pour suivre vos performances" />
                        <CheckItem text="Bénéficiez d'un support dédié tout au long de votre parcours" />
                    </ul>

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { icon: <Users size={16} strokeWidth={iconStroke} />, value: '12 000+', label: 'Apprenants actifs' },
                            { icon: <GraduationCap size={16} strokeWidth={iconStroke} />, value: '340+', label: 'Formateurs' },
                            { icon: <Star size={16} strokeWidth={iconStroke} />, value: '4.8/5', label: 'Note moyenne' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center">
                                <div className="flex justify-center text-neutral-400 mb-2">{s.icon}</div>
                                <div className="text-[16px] font-bold text-neutral-900 dark:text-white font-inter">{s.value}</div>
                                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Testimonials */}
                    <div className="space-y-4">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm">
                                <p className="text-[13px] text-neutral-600 dark:text-neutral-400 italic font-medium leading-relaxed mb-4">
                                    "{t.quote}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <img src={t.avatar} alt={t.author} className="w-9 h-9 rounded grayscale border border-neutral-200 dark:border-neutral-700" />
                                    <div>
                                        <div className="text-[13px] font-semibold text-neutral-800 dark:text-white">{t.author}</div>
                                        <div className="text-[11px] text-neutral-500 font-medium">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: Application form ─────────────────────────────────────────── */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm w-full max-w-lg mx-auto">

                        {/* Form header */}
                        <div className="mb-8">
                            <h2 className="text-[18px] font-semibold text-neutral-900 dark:text-white font-inter mb-1">
                                Candidature Formateur
                            </h2>
                            <p className="text-[12px] text-neutral-500 font-medium">
                                Étape {step} sur 2 — {step === 1 ? 'Votre profil' : 'Votre expertise'}
                            </p>
                            {/* Progress bar */}
                            <div className="mt-3 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#0A66C2] rounded-full transition-all duration-500"
                                    style={{ width: step === 1 ? '50%' : '100%' }}
                                />
                            </div>
                        </div>

                        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-5">

                            {/* ── STEP 1 ───────────────────────────────────────────── */}
                            {step === 1 && (
                                <>
                                    {/* Name row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">Prénom *</label>
                                            <input
                                                type="text" required
                                                value={form.firstName}
                                                onChange={e => set('firstName', e.target.value)}
                                                placeholder="Jean"
                                                className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">Nom *</label>
                                            <input
                                                type="text" required
                                                value={form.lastName}
                                                onChange={e => set('lastName', e.target.value)}
                                                placeholder="Dupont"
                                                className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">Adresse email *</label>
                                        <input
                                            type="email" required
                                            value={form.email}
                                            onChange={e => set('email', e.target.value)}
                                            placeholder="jean.dupont@email.com"
                                            className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition"
                                        />
                                    </div>

                                    {/* Audience size */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Taille de votre audience *
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={form.audienceSize}
                                                onChange={e => set('audienceSize', e.target.value)}
                                                className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] appearance-none pr-8"
                                            >
                                                <option value="" disabled>Sélectionner...</option>
                                                {AUDIENCE_SIZES.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown size={15} strokeWidth={iconStroke} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Domains */}
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Domaines d'expertise * <span className="normal-case font-normal text-neutral-400">(plusieurs choix possibles)</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {EXPERTISE_DOMAINS.map(d => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => toggleList('domains', d)}
                                                    className={`px-3 py-1.5 text-[12px] font-semibold rounded border transition-all ${form.domains.includes(d)
                                                        ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                                                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-[#0A66C2] hover:text-[#0A66C2]'
                                                        }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Teaching languages */}
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Langue(s) d'enseignement *
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES.map(l => (
                                                <button
                                                    key={l}
                                                    type="button"
                                                    onClick={() => toggleList('languages', l)}
                                                    className={`px-3 py-1.5 text-[12px] font-semibold rounded border transition-all ${form.languages.includes(l)
                                                        ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                                                        : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-[#0A66C2] hover:text-[#0A66C2]'
                                                        }`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                    </div>



                                    <button
                                        type="submit"
                                        disabled={!form.firstName || !form.lastName || !form.email || form.domains.length === 0 || form.languages.length === 0}
                                        className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded text-[13px] transition-all shadow-sm mt-2"
                                    >
                                        Continuer →
                                    </button>
                                </>
                            )}

                            {/* ── STEP 2 ───────────────────────────────────────────── */}
                            {step === 2 && (
                                <>
                                    {/* Expert topics */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Sur quels sujets êtes-vous expert ? * <span className="text-neutral-400 font-normal normal-case">(max. 200 caractères)</span>
                                        </label>
                                        <textarea
                                            required maxLength={200}
                                            value={form.expertiseTopics}
                                            onChange={e => set('expertiseTopics', e.target.value)}
                                            placeholder="Ex: UX Design, prototypage Figma, systèmes de design, accessibilité..."
                                            className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition resize-none h-20"
                                        />
                                        <div className="text-right text-[11px] text-neutral-400">{form.expertiseTopics.length}/200</div>
                                    </div>

                                    {/* Course idea */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Décrivez la formation que vous souhaitez créer * <span className="text-neutral-400 font-normal normal-case">(titre + 3 objectifs clés)</span>
                                        </label>
                                        <textarea
                                            required
                                            value={form.courseIdea}
                                            onChange={e => set('courseIdea', e.target.value)}
                                            placeholder="Formation : Masterclass UX Design de A à Z&#10;Objectifs :&#10;1. Maîtriser les fondamentaux du design thinking&#10;2. Créer des wireframes et prototypes avec Figma&#10;3. Conduire des tests utilisateurs efficaces"
                                            className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition resize-none h-32"
                                        />
                                    </div>

                                    {/* Motivation */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Pourquoi souhaitez-vous rejoindre WorkNet Academy ?
                                        </label>
                                        <textarea
                                            value={form.motivation}
                                            onChange={e => set('motivation', e.target.value)}
                                            placeholder="Partagez votre motivation..."
                                            className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition resize-none h-20"
                                        />
                                    </div>

                                    {/* Sample video */}
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                                            Vidéo de présentation <span className="text-neutral-400 font-normal normal-case">(lien YouTube ou autre, 1–2 min)</span>
                                        </label>
                                        <div className="relative">
                                            <PlayCircle size={14} strokeWidth={iconStroke} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                type="url"
                                                value={form.sampleVideoUrl}
                                                onChange={e => set('sampleVideoUrl', e.target.value)}
                                                placeholder="https://youtube.com/watch?v=..."
                                                className="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 rounded pl-9 pr-3 py-2.5 text-[13px] font-medium outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Terms */}
                                    <div className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded border border-neutral-200 dark:border-neutral-700">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            required
                                            checked={form.acceptTerms}
                                            onChange={e => set('acceptTerms', e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-[#0A66C2] accent-[#0A66C2]"
                                        />
                                        <label htmlFor="terms" className="text-[11px] text-neutral-500 font-medium leading-relaxed cursor-pointer">
                                            Je certifie que les informations fournies sont exactes et j'accepte les{' '}
                                            <span className="text-[#0A66C2] hover:underline cursor-pointer">conditions générales de WorkNet Academy</span>{' '}
                                            applicables aux formateurs. Mes données pourront être utilisées pour traiter cette candidature.
                                        </label>
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-semibold rounded text-[13px] transition-all hover:border-neutral-400"
                                        >
                                            ← Retour
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !form.courseIdea || !form.expertiseTopics || !form.acceptTerms}
                                            className="flex-[2] py-3 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded text-[13px] transition-all shadow-sm flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                                            ) : 'Soumettre ma candidature'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
