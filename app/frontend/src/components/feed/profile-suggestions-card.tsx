'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchProfileSuggestionsThunk } from '@/src/features/recommendations/services/recommendations-thunks';
import { trackSignalThunk } from '@/src/features/recommendations/services/recommendations-thunks';
import Link from 'next/link';
import { UserPlus, MapPin, Briefcase } from 'lucide-react';

export function ProfileSuggestionsCard() {
    const dispatch = useAppDispatch();
    const { profileSuggestions, loadingSuggestions } = useAppSelector((state) => state.recommendations);

    useEffect(() => {
        dispatch(fetchProfileSuggestionsThunk(5)); // Fetch top 5 suggestions
    }, [dispatch]);

    const handleConnect = (profileId: string) => {
        // Track the connection intent
        dispatch(trackSignalThunk({
            item_id: profileId,
            item_type: 'USER',
            action_type: 'CONNECT',
            weight: 10
        }));
    };

    const getReasonText = (reasons: string[]): string => {
        if (reasons.includes('mutual_connections')) return '🤝 Connexions mutuelles';
        if (reasons.includes('common_interests')) return '💼 Intérêts communs';
        if (reasons.includes('similar_behavior')) return '⭐ Goûts similaires';
        if (reasons.includes('same_location')) return '📍 Même ville';
        return 'Suggéré pour vous';
    };

    if (loadingSuggestions) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (!profileSuggestions || profileSuggestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-600" />
                    Suggestions pour vous
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Basées sur votre profil et vos interactions
                </p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {profileSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex gap-3">
                            <Link href={`/profile/${suggestion.id}`}>
                                <img
                                    src={suggestion.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggestion.full_name}`}
                                    alt={suggestion.full_name}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/profile/${suggestion.id}`}>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer truncate">
                                        {suggestion.full_name}
                                    </h4>
                                </Link>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                                    {suggestion.headline || 'Professionnel'}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {suggestion.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} />
                                            {suggestion.location}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                        {getReasonText(suggestion.reasons)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleConnect(suggestion.id)}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
                        >
                            <UserPlus size={14} />
                            Se connecter
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <Link href="/connections/suggestions" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Voir toutes les suggestions →
                </Link>
            </div>
        </div>
    );
}
