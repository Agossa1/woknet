"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Edit3, HelpCircle, Search, ArrowLeft, Briefcase, CheckCircle } from 'lucide-react';
import { jobSuggestionsApi, JobTitleSuggestion } from '@/src/features/jobs/services/job-suggestions-api';

export default function JobsCreateLandingPage() {
    const router = useRouter();
    const [jobTitle, setJobTitle] = useState('');
    const [suggestions, setSuggestions] = useState<JobTitleSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleTitleChange = async (value: string) => {
        setJobTitle(value);
        if (value.length > 1) {
            try {
                const res = await jobSuggestionsApi.getTitles(value);
                setSuggestions(res?.data || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching suggestions", error);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (title: string) => {
        setJobTitle(title);
        setShowSuggestions(false);
    };

    const handleStartWithAI = () => {
        if (!jobTitle.trim()) return;
        router.push(`/jobs/create/form?title=${encodeURIComponent(jobTitle)}&useAI=true`);
    };

    const handleStartManual = () => {
        if (!jobTitle.trim()) return;
        router.push(`/jobs/create/form?title=${encodeURIComponent(jobTitle)}&useAI=false`);
    };

    return (
        <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans text-neutral-800 antialiased">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-[1128px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/jobs"
                            className="flex items-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all text-xs font-bold uppercase tracking-tight group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Retour aux offres</span>
                        </Link>
                        <div className="h-4 w-px bg-neutral-100 dark:bg-neutral-800" />
                        <span className="font-medium text-[12px] text-neutral-400">Nouveau recrutement</span>
                    </div>
                </div>
            </div>

            <main className="max-w-[800px] mx-auto px-4 py-12">
                <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <div className="p-8 md:p-12">
                        {/* Title Section */}
                        <div className="mb-10">
                            <h1 className="text-2xl md:text-3xl font-normal text-neutral-900 dark:text-white mb-3 tracking-tight font-inter">
                                Trouver votre prochaine recrue
                            </h1>
                            <p className="text-sm text-neutral-500 font-medium">
                                Créez une offre d'emploi en quelques minutes et touchez des millions de professionnels.
                            </p>
                        </div>

                        {/* Input Section */}
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                                    Intitulé du poste
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                                        <Briefcase size={20} strokeWidth={1.25} />
                                    </div>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        onFocus={() => (jobTitle?.length ?? 0) > 1 && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="Ex: Développeur Fullstack React"
                                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] text-lg transition-all"
                                        onKeyPress={(e) => e.key === 'Enter' && jobTitle.trim() && handleStartWithAI()}
                                    />
                                </div>

                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-30 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded shadow-xl max-h-60 overflow-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => selectSuggestion(suggestion.title)}
                                                className="w-full px-5 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-50 dark:border-neutral-800 last:border-0"
                                            >
                                                <div className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">{suggestion.title}</div>
                                                <div className="text-[11px] text-neutral-500 mt-0.5 uppercase tracking-tighter">{suggestion.category}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* CTA Section */}
                            <div className="pt-4 flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={handleStartWithAI}
                                    disabled={!jobTitle.trim()}
                                    className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white py-3.5 px-6 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Sparkles size={18} strokeWidth={1.5} />
                                    Rédiger avec l'IA
                                </button>
                                <button
                                    onClick={handleStartManual}
                                    disabled={!jobTitle.trim()}
                                    className="flex-1 bg-white dark:bg-neutral-800 border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-neutral-700 py-3.5 px-6 rounded-full font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Rédiger manuellement
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-start gap-4 max-w-lg">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 shrink-0">
                                <CheckCircle size={20} strokeWidth={1.25} />
                            </div>
                            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                                <strong>Le saviez-vous ?</strong> 86% des entreprises utilisant l'assistance IA trouvent un candidat qualifié en moins de 24 heures. L'IA analyse les besoins de votre entreprise pour attirer les meilleurs talents.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[11px] text-neutral-400 font-medium">
                        En continuant, vous acceptez nos <Link href="#" className="text-neutral-500 hover:text-[#0A66C2] underline decoration-neutral-300">Conditions d'utilisation</Link> et notre <Link href="#" className="text-neutral-500 hover:text-[#0A66C2] underline decoration-neutral-300">Politique de confidentialité</Link>.
                    </p>
                </div>
            </main>
        </div>
    );
}
