"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Edit3, HelpCircle, Search } from 'lucide-react';
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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="text-white" size={28} />
                    </div>
                </div>

                {/* Greeting */}
                <div className="text-center mb-8">
                    <h1 className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                        Bonjour,
                    </h1>
                    <h2 className="text-4xl font-normal text-black dark:text-white mb-4">
                        Trouvez votre<br />prochaine recrue
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        86% des petites entreprises trouvent un candidat qualifié en un jour
                    </p>
                </div>

                {/* Job Title Input */}
                <div className="mb-6 relative">
                    <label className="flex items-center gap-2 text-sm font-medium text-black dark:text-white mb-2">
                        Intitulé de poste
                        <HelpCircle size={14} className="text-neutral-400" />
                    </label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                        <input
                            type="search"
                            value={jobTitle}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            onFocus={() => (jobTitle?.length ?? 0) > 1 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="Développeur web"
                            className="w-full pl-12 pr-4 py-4 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 text-lg"
                            onKeyPress={(e) => e.key === 'Enter' && jobTitle.trim() && handleStartWithAI()}
                        />
                    </div>

                    {showSuggestions && (suggestions?.length ?? 0) > 0 && (
                        <div className="absolute z-30 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-2xl max-h-64 overflow-auto animate-in fade-in zoom-in duration-200">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => selectSuggestion(suggestion.title)}
                                    className="w-full px-5 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                                >
                                    <div className="font-medium text-black dark:text-white">{suggestion.title}</div>
                                    <div className="text-xs text-neutral-500 mt-0.5">{suggestion.category}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 mb-8">
                    <button
                        onClick={handleStartWithAI}
                        disabled={!jobTitle.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <Sparkles size={20} />
                        Rédiger avec l'IA
                    </button>

                    <button
                        onClick={handleStartManual}
                        disabled={!jobTitle.trim()}
                        className="w-full text-blue-600 dark:text-blue-400 hover:underline py-3 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Rédiger moi-même
                    </button>
                </div>

                {/* Info Text */}
                <div className="text-center space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <p>
                        Si vous rédigez à l'aide de l'IA, nous utiliserons l'intitulé de poste et les détails de votre page Entreprise pour vous suggérer une offre d'emploi.{' '}
                        <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            En savoir plus
                        </Link>
                    </p>
                    <p>
                        Des limites peuvent s'appliquer aux offres d'emploi gratuites.{' '}
                        <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            Voir notre politique
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
