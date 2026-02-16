'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchTrendingHashtagsThunk } from '@/src/features/hashtags/services/hashtags-thunks';
import Link from 'next/link';
import { TrendingUp, Hash } from 'lucide-react';

export function TrendingHashtagsCard() {
    const dispatch = useAppDispatch();
    const { trending, loading } = useAppSelector((state) => state.hashtags);

    useEffect(() => {
        dispatch(fetchTrendingHashtagsThunk(6));
    }, [dispatch]);

    if (loading && trending.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (trending.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    Hashtags populaires
                </h3>
            </div>

            <div className="p-2">
                {trending.map((hashtag) => (
                    <Link
                        key={hashtag.id}
                        href={`/hashtag/${hashtag.name}`}
                        className="flex flex-col p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                    >
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1">
                            <Hash size={14} className="text-gray-400 group-hover:text-blue-500" />
                            {hashtag.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-4">
                            {hashtag.usage_count} posts •{' '}
                            {hashtag.posts_last_day > 0
                                ? `${hashtag.posts_last_day} aujourd'hui`
                                : 'Populaire cette semaine'}
                        </span>
                    </Link>
                ))}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium w-full text-center">
                    Voir plus
                </button>
            </div>
        </div>
    );
}
