"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/src/features/jobs/services/jobs-api';
import { CreateJobDTO, WorkType } from '@/src/features/jobs/services/jobs-types';
import {
    ArrowLeft, Sparkles, Loader2, Building2, MapPin, Briefcase,
    X, HelpCircle, Lightbulb, Search, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

import { jobSuggestionsApi, JobTitleSuggestion, WorkLocationSuggestion } from '@/src/features/jobs/services/job-suggestions-api';
import RichTextEditor from '@/src/components/ui/RichTextEditor';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/store';
import { companiesApi } from '@/src/features/companies/services/companies-api';

export default function JobFormPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const useAI = searchParams.get('useAI') === 'true';
    const initialTitle = searchParams.get('title') || '';

    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Standard icon stroke
    const iconStroke = 1.25;

    // Suggestions states
    const [titleSuggestions, setTitleSuggestions] = useState<JobTitleSuggestion[]>([]);
    const [locationSuggestions, setLocationSuggestions] = useState<WorkLocationSuggestion[]>([]);
    const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

    const [formData, setFormData] = useState<CreateJobDTO>({
        title: initialTitle,
        company_id: '',
        description: '',
        requirements: '',
        location: '',
        work_type: 'full-time',
        salary_min: undefined,
        salary_max: undefined,
        currency: 'EUR',
        is_remote: false,
        application_url: '',
        status: 'draft',
    });

    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [myCompanies, setMyCompanies] = useState<any[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

    useEffect(() => {
        const fetchOrSetCompany = async () => {
            if (isAuthenticated) {
                setIsLoadingCompanies(true);
                try {
                    const res = await companiesApi.getMyCompanies();
                    if (res.success && res.data.length > 0) {
                        setMyCompanies(res.data);
                        setFormData(prev => ({ ...prev, company_id: res.data[0].id }));
                    } else {
                        console.warn("L'utilisateur n'a pas d'entreprise.");
                    }
                } catch (err) {
                    console.error("Erreur lors de la récupération des entreprises", err);
                } finally {
                    setIsLoadingCompanies(false);
                }
            }
        };
        fetchOrSetCompany();
    }, [isAuthenticated]);

    const hasGenerated = React.useRef(false);
    useEffect(() => {
        if (useAI && initialTitle && !hasGenerated.current) {
            hasGenerated.current = true;
            generateWithAI();
        }
    }, []);

    const handleTitleChange = async (value: string) => {
        setFormData({ ...formData, title: value });
        if (value.length > 1) {
            try {
                const res = await jobSuggestionsApi.getTitles(value);
                setTitleSuggestions(res?.data || []);
                setShowTitleSuggestions(true);
            } catch (error) {
                console.error("Error fetching title suggestions", error);
            }
        } else {
            setShowTitleSuggestions(false);
        }
    };

    const handleLocationChange = async (value: string) => {
        setFormData({ ...formData, location: value });
        if (value.length > 1) {
            try {
                const res = await jobSuggestionsApi.getLocations(value);
                setLocationSuggestions(res?.data || []);
                setShowLocationSuggestions(true);
            } catch (error) {
                console.error("Error fetching location suggestions", error);
            }
        } else {
            setShowLocationSuggestions(false);
        }
    };

    const selectTitleSuggestion = (title: string) => {
        setFormData({ ...formData, title });
        setShowTitleSuggestions(false);
    };

    const selectLocationSuggestion = (location: string) => {
        setFormData({ ...formData, location });
        setShowLocationSuggestions(false);
    };

    const generateWithAI = async () => {
        setIsGenerating(true);
        try {
            const response = await jobsApi.generateDescription({
                job_title: formData.title || initialTitle,
                industry: '',
                tone: 'Professionnel, institutionnel et engageant',
                keywords: [],
            });

            const generated = response.data as any;
            setFormData(prev => ({
                ...prev,
                description: generated.full_content || '',
                salary_min: generated.suggested_salary_range?.min,
                salary_max: generated.suggested_salary_range?.max,
            }));

            toast.success("Description générée avec succès");
        } catch (error: any) {
            toast.error(error.userMessage || "Erreur lors de la génération");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (status: 'draft' | 'published') => {
        if (!formData.title) {
            toast.error("Veuillez renseigner l'intitulé du poste");
            return;
        }

        if (!formData.company_id) {
            toast.error("Veuillez sélectionner une entreprise");
            return;
        }

        setIsSaving(true);
        try {
            const response = await jobsApi.createJob({ ...formData, status });
            toast.success(`Offre ${status === 'published' ? 'publiée' : 'enregistrée'}`);
            router.push(`/jobs/${response.data.slug}`);
        } catch (error: any) {
            toast.error(error.userMessage || "Erreur de création");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingCompanies) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-[#0A66C2]" size={32} />
            </div>
        );
    }

    if (myCompanies.length === 0) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="bg-white dark:bg-neutral-900 p-10 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm max-w-md w-full">
                    <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-100 dark:border-neutral-700">
                        <Building2 size={32} strokeWidth={iconStroke} className="text-neutral-400" />
                    </div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 font-inter">Une entreprise est requise</h1>
                    <p className="text-sm text-neutral-500 mb-8 leading-relaxed font-medium">
                        Pour publier une offre d'emploi, vous devez d'abord créer ou administrer une page entreprise.
                    </p>
                    <Link
                        href="/companies"
                        className="block w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold rounded transition-all text-sm shadow-sm"
                    >
                        Créer une page entreprise
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans antialiased text-neutral-800">
            {/* Header - Corporate Minimalist */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-[1128px] mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="text-neutral-500 hover:text-black dark:hover:text-white pb-0.5">
                            <X size={22} strokeWidth={iconStroke} />
                        </button>
                        <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 font-inter">Publication d'offre</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleSubmit('draft')}
                            disabled={isSaving}
                            className="text-xs font-semibold text-[#0A66C2] hover:underline transition-all"
                        >
                            Enregistrer brouillon
                        </button>
                        <button
                            onClick={() => handleSubmit('published')}
                            disabled={isSaving}
                            className="px-6 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold rounded-full transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving && <Loader2 className="animate-spin" size={12} strokeWidth={2} />}
                            Publier l'offre
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1128px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

                    {/* Left: Detailed Form */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                            <div className="mb-8 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-inter">Analyse de poste</h2>
                                <p className="text-xs text-neutral-500 font-medium mt-1">Étape 1 sur 2 : Configuration initiale</p>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">Intitulé officiel *</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} strokeWidth={iconStroke} />
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => handleTitleChange(e.target.value)}
                                                onFocus={() => formData.title.length > 1 && setShowTitleSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)}
                                                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 outline-none focus:border-[#0A66C2] transition-colors text-sm font-medium"
                                                placeholder="Rechercher un intitulé..."
                                            />
                                        </div>

                                        {showTitleSuggestions && (titleSuggestions?.length ?? 0) > 0 && (
                                            <div className="absolute z-30 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded shadow-lg overflow-hidden">
                                                {titleSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => selectTitleSuggestion(suggestion.title)}
                                                        className="w-full px-4 py-2.5 text-left text-xs hover:bg-neutral-50 text-neutral-700 dark:text-neutral-300 transition-colors border-b border-neutral-50 dark:border-neutral-800 last:border-0"
                                                    >
                                                        {suggestion.title}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">Structure émettrice *</label>
                                        <div className="relative">
                                            {myCompanies.length > 1 ? (
                                                <select
                                                    value={formData.company_id}
                                                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                                    className="w-full py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 outline-none focus:border-[#0A66C2] transition-colors text-sm font-medium appearance-none pl-10 cursor-pointer"
                                                >
                                                    {myCompanies.map(company => (
                                                        <option key={company.id} value={company.id}>{company.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="w-full py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 text-sm font-medium pl-10 text-neutral-500 cursor-not-allowed">
                                                    {myCompanies[0]?.name}
                                                </div>
                                            )}
                                            <Building2 size={16} strokeWidth={iconStroke} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">Modalités de présence</label>
                                        <select
                                            value={formData.is_remote ? 'remote' : 'on-site'}
                                            onChange={(e) => setFormData({ ...formData, is_remote: e.target.value === 'remote' })}
                                            className="w-full py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 outline-none focus:border-[#0A66C2] transition-colors text-sm font-medium appearance-none"
                                        >
                                            <option value="on-site">Sur site uniquement</option>
                                            <option value="remote">Télétravail total</option>
                                            <option value="hybrid">Mode hybride</option>
                                        </select>
                                    </div>

                                    <div className="relative">
                                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">Localisation physique</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} strokeWidth={iconStroke} />
                                            <input
                                                type="text"
                                                value={formData.location || ''}
                                                onChange={(e) => handleLocationChange(e.target.value)}
                                                onFocus={() => formData.location && (formData.location?.length ?? 0) > 1 && setShowLocationSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 outline-none focus:border-[#0A66C2] transition-colors text-sm font-medium"
                                                placeholder="Ville ou pays..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-50 dark:border-neutral-800 pt-6">
                                    <button
                                        type="button"
                                        onClick={generateWithAI}
                                        disabled={isGenerating}
                                        className="inline-flex items-center gap-2.5 text-[#0A66C2] font-semibold text-xs hover:underline disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} strokeWidth={iconStroke} />}
                                        Optimiser la description via l'intelligence artificielle
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 font-inter">Cœur de l'offre</h2>
                            <RichTextEditor
                                value={formData.description || ''}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                            />
                        </div>
                    </div>

                    {/* Right: Context & Guidelines */}
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-50 dark:border-neutral-800">
                                <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 rounded border border-neutral-100 dark:border-neutral-700 flex items-center justify-center shrink-0">
                                    <Building2 size={18} strokeWidth={iconStroke} className="text-neutral-400" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">{formData.title || "Titre du poste"}</h4>
                                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-tight">Version brouillon</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <HelpItem icon={<Briefcase size={14} strokeWidth={iconStroke} />} label="Type de contrat" value="CDI / Temps plein" />
                                <HelpItem icon={<MapPin size={14} strokeWidth={iconStroke} />} label="Lieu" value={formData.location || "Non spécifié"} />
                                <HelpItem icon={<Lightbulb size={14} strokeWidth={iconStroke} />} label="Impact" value="Élevé" />
                            </div>
                        </section>

                        <div className="bg-blue-50/40 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 p-5">
                            <div className="flex items-center gap-2 text-[#0A66C2] mb-3">
                                <CheckCircle2 size={16} strokeWidth={2} />
                                <h4 className="text-xs font-bold">Conseils de visibilité</h4>
                            </div>
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-normal font-medium">
                                Précisez vos attentes technologiques et les bénéfices sociaux pour attirer 25% de candidats qualifiés en plus.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HelpItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-neutral-400 mt-0.5">{icon}</span>
            <div>
                <p className="text-[10px] text-neutral-400 font-medium">{label}</p>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{value}</p>
            </div>
        </div>
    );
}
