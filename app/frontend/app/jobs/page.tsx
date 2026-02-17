"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jobsApi } from '@/src/features/jobs/services/jobs-api';
import { Job } from '@/src/features/jobs/services/jobs-types';
import {
  Briefcase, Plus, MapPin, Clock, Building2, Search, Circle
} from 'lucide-react';
import { toast } from 'sonner';

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'remote'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [filter]);

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

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans">
      {/* Simple Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 font-inter">
                Opportunités de carrière
              </h1>
              <p className="text-[15px] text-neutral-500 font-medium">
                {filteredJobs.length} {filteredJobs.length > 1 ? 'postes disponibles pour vous' : 'poste disponible pour vous'}
              </p>
            </div>

            <Link
              href="/jobs/create"
              className="bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} strokeWidth={2} />
              Publier une offre
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Rechercher par poste, entreprise ou mots-clés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-all font-medium"
              />
            </div>

            <div className="flex gap-2 p-1 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800">
              {['all', 'published', 'remote'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f
                    ? 'bg-white dark:bg-neutral-800 text-[#0A66C2] shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                  {f === 'all' ? 'Toutes' : f === 'published' ? 'En ligne' : 'Télétravail'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-neutral-100 dark:border-neutral-800 rounded-xl p-8 animate-pulse">
                <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3 mb-4" />
                <div className="h-4 bg-neutral-50 dark:bg-neutral-800 rounded w-1/4 mb-3" />
                <div className="h-4 bg-neutral-50 dark:bg-neutral-800 rounded w-1/5" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-24 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
            <Briefcase className="mx-auto text-neutral-200 dark:text-neutral-800 mb-4" size={56} strokeWidth={1} />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Aucune offre ne correspond</h3>
            <p className="text-neutral-500 max-w-xs mx-auto">Essayez d'ajuster vos filtres ou lancez une nouvelle recherche.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map(job => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="group block bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-7 hover:border-[#0A66C2]/30 hover:shadow-xl hover:shadow-[#0A66C2]/5 transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-6 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-[#0A66C2] transition-colors font-inter">
                        {job.title}
                      </h3>
                      {job.status === 'published' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-neutral-600 dark:text-neutral-400 mb-5">
                      <Building2 size={16} strokeWidth={1.5} className="text-neutral-400" />
                      {job.company_id ? 'Entreprise certifiée' : 'Secteur privé'}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {job.is_remote && (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-[#0A66C2] rounded-full text-[11px] font-bold uppercase tracking-wider">
                        Remote
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-semibold text-neutral-500 dark:text-neutral-400 border-t border-neutral-50 dark:border-neutral-800 pt-5 mt-2">
                  {job.location && (
                    <span className="flex items-center gap-2">
                      <MapPin size={16} strokeWidth={1.5} className="text-neutral-300" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Clock size={16} strokeWidth={1.5} className="text-neutral-300" />
                    <span className="capitalize">{job.work_type.replace('-', ' ')}</span>
                  </span>
                  {job.salary_min && (
                    <span className="text-neutral-900 dark:text-white font-bold">
                      {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()} {job.currency}
                    </span>
                  )}
                  <span className="text-xs text-neutral-300 font-medium ml-auto">
                    Publié le {new Date(job.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
