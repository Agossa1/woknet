"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/src/features/jobs/services/jobs-api';
import { Job } from '@/src/features/jobs/services/jobs-types';
import { recommendationsApi } from '@/src/features/recommendations/services/recommendations-api';
import {
  Briefcase, Plus, MapPin, Clock, Building2, Search, Sparkles,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecsLoading, setIsRecsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'remote'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (filter === 'published') filters.status = 'published';
      if (filter === 'remote') filters.is_remote = true;
      const response = await jobsApi.getAllJobs(filters);
      setJobs(response.data);
    } catch (error: any) {
      toast.error(error.userMessage || "Erreur lors du chargement des offres");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setIsRecsLoading(true);
      const response = await recommendationsApi.getJobSuggestions(3);
      setRecommendedJobs(response);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsRecsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-black font-sans selection:bg-blue-100">
      {/* Search & Header Section */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-neutral-500 hover:text-neutral-900 dark:hover:text-white group"
            >
              <ArrowLeft size={16} strokeWidth={1.25} className="group-hover:-translate-x-1 transition-transform" />
              <span>Retour à l’espace pro</span>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 max-w-2xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#0A66C2] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Rechercher par poste, entreprise ou ville..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2.5 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                {['all', 'published', 'remote'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${filter === f
                      ? 'bg-[#0A66C2] text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                  >
                    {f === 'all' ? 'Toutes les offres' : f === 'published' ? 'Direct' : 'À distance'}
                  </button>
                ))}
              </div>

              <Link
                href="/jobs/create"
                className="bg-[#0A66C2] hover:bg-[#004182] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus size={16} strokeWidth={2.5} />
                Publier une offre
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Featured Recommendations */}
        {recommendedJobs.length > 0 && !searchTerm && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} strokeWidth={1.25} className="text-[#0A66C2]" />
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-white font-inter">Sélectionnés pour vous</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedJobs.map(job => (
                <Link
                  key={`rec-${job.id}`}
                  href={`/jobs/${job.slug}`}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-6 rounded-2xl hover:border-[#0A66C2]/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col h-full"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 size={24} className="text-neutral-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors line-clamp-1 text-[15px] font-inter">
                        {job.title}
                      </h4>
                      <p className="text-[13px] text-[#0A66C2] font-semibold">{job.company_name}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-neutral-400">
                      <span className="flex items-center gap-1.5"><MapPin size={14} className="text-neutral-200" /> {job.location}</span>
                      {job.is_remote && <span className="text-blue-500 font-bold">À distance</span>}
                    </div>
                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-neutral-900 dark:text-white">
                        {job.salary_min?.toLocaleString()} {job.currency}
                      </span>
                      <ChevronRight size={18} strokeWidth={1.25} className="text-neutral-400 group-hover:text-[#0A66C2] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Unified Job List */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-neutral-300/60 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight font-inter">
              {searchTerm ? `Résultats pour "${searchTerm}"` : 'Dernières opportunités'}
            </h2>
            <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{filteredJobs.length} offres disponibles</div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 animate-pulse h-28" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 py-20 text-center shadow-sm">
              <div className="w-14 h-14 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-5 border border-neutral-100 dark:border-neutral-700">
                <Briefcase className="text-neutral-300" size={26} strokeWidth={1.5} />
              </div>
              <p className="text-neutral-900 dark:text-white font-semibold text-sm">Aucune offre trouvée</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mt-1">
                Essayez de modifier votre recherche ou vos filtres.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setFilter('all'); }}
                  className="px-5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Réinitialiser
                </button>
                <Link
                  href="/jobs/create"
                  className="px-5 py-2.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Publier une offre
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm hover:border-[#0A66C2] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex gap-5 items-center">
                    <div className="w-14 h-14 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 size={24} className="text-neutral-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors mb-2 flex items-center gap-3 font-inter">
                        {job.title}
                        {job.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
                        <span className="text-[#0A66C2] font-semibold">{job.company_name || 'Partenaire WorkNet'}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} strokeWidth={1.25} className="text-neutral-400" /> {job.location}</span>
                        {job.is_remote && (
                          <span className="text-[#0A66C2] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-[11px] font-semibold">À distance</span>
                        )}
                        <span className="flex items-center gap-1.5"><Clock size={14} strokeWidth={1.25} className="text-neutral-400" /> {job.work_type.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800 pt-5 md:pt-0">
                    <div className="text-right">
                      <p className="text-[15px] font-semibold text-neutral-900 dark:text-white mb-0.5">
                        {job.salary_min ? `${job.salary_min.toLocaleString()} ${job.currency}` : 'Salaire confidentiel'}
                      </p>
                      <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        Posté il y a {Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))} jours
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-[#0A66C2] transition-colors">
                      <ChevronRight size={18} strokeWidth={1.25} className="text-neutral-400 group-hover:text-white transition-all group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
