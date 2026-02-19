'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchJobRecommendationsThunk } from '@/src/features/recommendations/services/recommendations-thunks';
import { trackSignalThunk } from '@/src/features/recommendations/services/recommendations-thunks';
import Link from 'next/link';
import { Briefcase, MapPin, ChevronRight, Building2, Sparkles } from 'lucide-react';

export function JobRecommendationsCard() {
    const dispatch = useAppDispatch();
    const { jobRecommendations, loadingJobs } = useAppSelector((state) => state.recommendations);

    useEffect(() => {
        dispatch(fetchJobRecommendationsThunk(3)); // Fetch top 3 job recommendations
    }, [dispatch]);

    const handleJobClick = (jobId: string) => {
        dispatch(trackSignalThunk({
            item_id: jobId,
            item_type: 'JOB',
            action_type: 'CLICK'
        }));
    };

    if (loadingJobs) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!jobRecommendations || jobRecommendations.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                        <Briefcase size={16} className="text-[#0A66C2]" />
                        Offres d'emploi  pour vous
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                        Basé sur votre profil et vos intérêts
                    </p>
                </div>

            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {jobRecommendations.map((job) => (
                    <Link
                        key={job.id}
                        href={`/jobs/${job.slug}`}
                        onClick={() => handleJobClick(job.id)}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors block group"
                    >
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shrink-0">
                                {job.company_logo ? (
                                    <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={18} className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-[#0A66C2] transition-colors truncate">
                                    {job.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                                    {job.company_name}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {job.location && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                            <MapPin size={10} />
                                            {job.location}
                                        </span>
                                    )}
                                    {job.is_remote && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                            Remote
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A66C2] transition-colors" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-center">
                <Link href="/jobs" className="text-xs text-[#0A66C2] dark:text-blue-400 hover:text-[#004182] font-bold transition-colors">
                    Explorer d'autres opportunités →
                </Link>
            </div>
        </div>
    );
}
