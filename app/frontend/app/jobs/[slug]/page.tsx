"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/src/features/jobs/services/jobs-api';
import { Job } from '@/src/features/jobs/services/jobs-types';
import { companiesApi } from '@/src/features/companies/services/companies-api';
import { Company } from '@/src/features/companies/services/companies-types';
import { recommendationsApi } from '@/src/features/recommendations/services/recommendations-api';
import {
    MapPin, Briefcase, Clock, Building2, ArrowLeft,
    Globe, Share2, Bookmark, ExternalLink, ShieldCheck,
    CheckCircle, Calendar, DollarSign, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function JobDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const iconStroke = 1.25;

    useEffect(() => {
        const fetchJobAndCompany = async () => {
            try {
                setIsLoading(true);
                const jobRes = await jobsApi.getJobBySlug(slug as string);
                const jobData = jobRes.data;
                setJob(jobData);

                if (jobData?.company_id) {
                    const companyRes = await companiesApi.getCompanyById(jobData.company_id);
                    setCompany(companyRes.data);
                }

                // Track VIEW signal
                recommendationsApi.trackSignal({
                    item_id: jobData.id,
                    item_type: 'JOB',
                    action_type: 'VIEW'
                }).catch(err => console.error("Failed to track view signal", err));

            } catch (err: any) {
                console.error("Error fetching job details:", err);
                setError(err.userMessage || "Offre d'emploi non trouvée");
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchJobAndCompany();
    }, [slug]);

    // Fonction pour formater le texte brut de l'IA en HTML structuré
    const formatDescription = (text: string) => {
        if (!text) return "";

        // Si le texte contient déjà du HTML, on le laisse tel quel (mais on s'assure qu'il y a des styles)
        if (text.includes('<p>') || text.includes('<li>')) {
            return text;
        }

        // Sinon, on tente de structurer le texte brut
        const sections = [
            "Description de l'entreprise",
            "Description du poste",
            "Qualifications",
            "Localisations",
            "Missions",
            "Responsabilités",
            "Avantages"
        ];

        let formatted = text;

        // Remplacement des titres de section par des balises h3 stylisées
        sections.forEach(section => {
            const regex = new RegExp(`${section}`, 'g');
            formatted = formatted.replace(regex, `###${section}###`);
        });

        // Split par les titres identifiés
        const parts = formatted.split(/###(.+?)###/);

        let html = "";
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            if (!part) continue;

            if (sections.includes(part)) {
                html += `<h3 class="text-lg font-bold text-neutral-900 dark:text-white mt-10 mb-4 font-inter">${part}</h3>`;
            } else {
                // Gestion des listes à puces
                const lines = part.split('\n');
                let inList = false;

                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d+\./.test(trimmedLine)) {
                        if (!inList) {
                            html += `<ul class="space-y-2 mb-4 ml-4">`;
                            inList = true;
                        }
                        const content = trimmedLine.replace(/^[-•\d+.]\s*/, '');
                        html += `<li class="relative pl-2 text-neutral-600 dark:text-neutral-400">
                                    <span class="absolute -left-4 text-[#0A66C2]">•</span>
                                    ${content}
                                 </li>`;
                    } else {
                        if (inList) {
                            html += `</ul>`;
                            inList = false;
                        }
                        if (trimmedLine) {
                            html += `<p class="mb-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">${trimmedLine}</p>`;
                        }
                    }
                });
                if (inList) html += `</ul>`;
            }
        }

        return html;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-[#0A66C2]" size={32} />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-[#F4F2EE] dark:bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mb-6 text-neutral-300">
                    <Briefcase size={32} strokeWidth={1} />
                </div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Offre indisponible</h1>
                <p className="text-sm text-neutral-500 mb-8 max-w-xs mx-auto">Cette offre d'emploi n'existe plus ou l'entreprise a terminé son recrutement.</p>
                <Link href="/jobs" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 transition-colors">
                    <ArrowLeft size={16} strokeWidth={1.5} />
                    Retour aux offres
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans text-neutral-800 antialiased pb-20">
            {/* Minimalist Top Nav */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-[1128px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/jobs"
                            className="flex items-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all text-xs font-bold uppercase tracking-tight group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Retour aux offres</span>
                        </Link>
                        <div className="h-4 w-px bg-neutral-100 dark:bg-neutral-800" />
                        <span className="font-medium text-[12px] text-neutral-400 hidden sm:block">Fiche de poste détaillée</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors">
                            <Share2 size={16} strokeWidth={iconStroke} />
                            Partager
                        </button>
                        <button className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors">
                            <Bookmark size={20} strokeWidth={iconStroke} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1128px] mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

                    {/* Left Column: Job Details */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                            {/* Company Header Banner (Optional style) */}
                            <div className="h-24 md:h-32 bg-neutral-100 dark:bg-neutral-800 relative">
                                {company?.banner_url && <img src={company.banner_url} className="w-full h-full object-cover" />}
                                <div className="absolute -bottom-10 left-8 p-1 bg-white dark:bg-neutral-900 rounded-lg shadow-md border border-neutral-100 dark:border-neutral-800">
                                    <div className="w-20 h-20 rounded bg-white dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                        {company?.logo_url ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" /> : <Building2 size={32} className="text-neutral-300" />}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-14 pb-8 px-8 md:px-10">
                                <div className="mb-8">
                                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2 font-inter tracking-tight">
                                        {job?.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-neutral-600 dark:text-neutral-400 font-medium">
                                        <Link href={`/companies/${company?.slug}`} className="text-neutral-900 dark:text-white font-bold hover:text-[#0A66C2] hover:underline transition-colors decoration-2 underline-offset-4">
                                            {company?.name}
                                        </Link>
                                        <span>•</span>
                                        <span>{job?.location}</span>
                                        {job?.is_remote && (
                                            <>
                                                <span>•</span>
                                                <span className="text-[#0A66C2]">Télétravail</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span className="text-neutral-400">Posté le {job?.created_at ? new Date(job.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-6 mb-10 pt-6 border-t border-neutral-50 dark:border-neutral-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                                            <Briefcase size={18} className="text-neutral-500" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Contrat</p>
                                            <p className="text-sm font-semibold capitalize">{job?.work_type?.replace('-', ' ')}</p>
                                        </div>
                                    </div>
                                    {job?.salary_min && (
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                                                <DollarSign size={18} className="text-neutral-500" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Rémunération</p>
                                                <p className="text-sm font-semibold">{job?.salary_min?.toLocaleString()} - {job?.salary_max?.toLocaleString()} {job?.currency}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                                            <ShieldCheck size={18} className="text-neutral-500" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Vérification</p>
                                            <p className="text-sm font-semibold flex items-center gap-1.5 text-green-600 dark:text-green-500">
                                                Certifié WorkNet
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Parsed Content */}
                                <div className="job-details-rich-content">
                                    <div
                                        className="text-[16px] leading-[1.6] text-neutral-700 dark:text-neutral-300"
                                        dangerouslySetInnerHTML={{ __html: formatDescription(job?.description || '') }}
                                    />

                                    {job?.requirements && (
                                        <div className="mt-8 pt-8 border-t border-neutral-50 dark:border-neutral-800">
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 font-inter">Profil et Prérequis</h3>
                                            <div
                                                className="text-[16px] leading-[1.6] text-neutral-700 dark:text-neutral-300"
                                                dangerouslySetInnerHTML={{ __html: formatDescription(job?.requirements || '') }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interaction Bar */}
                    <div className="space-y-6 lg:sticky lg:top-[88px]">
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                            <button
                                onClick={() => {
                                    if (job) {
                                        recommendationsApi.trackSignal({ item_id: job.id, item_type: 'JOB', action_type: 'APPLY' });
                                        toast.success("Votre candidature a été envoyée !");
                                    }
                                }}
                                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white py-3 md:py-3.5 rounded-full font-bold text-[15px] transition-all mb-4 shadow-sm flex items-center justify-center gap-2"
                            >
                                Postuler maintenant
                            </button>
                            <button className="w-full border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 py-3 md:py-3.5 rounded-full font-bold text-[15px] transition-all">
                                Enregistrer
                            </button>

                            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                <h4 className="text-[12px] font-bold text-neutral-500 mb-5">À propos du recruteur</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-100 dark:border-neutral-700 shrink-0">
                                        {company?.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" /> : <Building2 className="text-neutral-300" size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <Link href={`/companies/${company?.slug}`} className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block truncate hover:text-[#0A66C2]">
                                            {company?.name}
                                        </Link>
                                        <p className="text-[11px] text-neutral-500 font-medium truncate">
                                            {company?.company_type || "Secteur privé"} • {company?.company_size || "11-50"} employés
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/companies/${company?.slug}`}
                                    className="mt-5 flex items-center justify-center w-full py-2 border border-[#0A66C2] text-[#0A66C2] text-[13px] font-bold rounded hover:bg-blue-50 transition-colors"
                                >
                                    Voir la page entreprise
                                </Link>
                            </div>
                        </div>

                        <div className="bg-neutral-900 dark:bg-neutral-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={64} strokeWidth={1} />
                            </div>
                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-[#FFB020]">
                                    <ShieldCheck size={18} strokeWidth={2.5} />
                                    <span className="text-[11px] font-black tracking-widest uppercase">Verified Recruiter</span>
                                </div>
                                <h3 className="font-bold text-base font-inter">Recrutement sécurisé</h3>
                                <p className="text-neutral-400 text-xs leading-relaxed font-medium">WorkNet vérifie manuellement chaque entreprise pour vous protéger contre le spam et les fausses offres.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

