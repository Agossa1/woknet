'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchPostsByHashtagThunk } from '@/src/features/hashtags/services/hashtags-thunks';
import PostCard from '@/src/components/feed/post-card';
import { ProfileSidebar, SuggestionsSidebar } from '@/src/components/layout';
import { Hash, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HashtagPage() {
    const { name } = useParams();
    const hashtagName = typeof name === 'string' ? name : '';
    const dispatch = useAppDispatch();
    const { posts, loadingPosts } = useAppSelector((state) => state.hashtags);

    useEffect(() => {
        if (hashtagName) {
            dispatch(fetchPostsByHashtagThunk({ name: hashtagName }));
        }
    }, [dispatch, hashtagName]);

    return (
        <div className="w-full bg-gray-50 dark:bg-black min-h-screen">
            <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Left Sidebar */}
                <div className="hidden md:block md:col-span-3 lg:col-span-3">
                    <ProfileSidebar />
                </div>

                {/* Center Feed */}
                <div className="col-span-1 md:col-span-9 lg:col-span-6 space-y-4">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                        <Link
                            href="/feed"
                            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Retour au flux
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Hash size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic">
                                    #{hashtagName}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {posts.length} {posts.length > 1 ? 'publications associées' : 'publication associée'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loader */}
                    {loadingPosts && posts.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <PostCard key={post.unique_id || post.id} post={post} />
                                ))
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Hash size={32} />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        Aucune publication trouvée
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                                        Soyez le premier à publier avec #{hashtagName} !
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="hidden lg:block lg:col-span-3">
                    <SuggestionsSidebar />
                </div>
            </div>
        </div>
    );
}
