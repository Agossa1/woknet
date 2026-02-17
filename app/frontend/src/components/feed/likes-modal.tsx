'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { LikeWithUser, ReactionType } from '@/src/features/posts/services/posts-types';
import { postsApi } from '@/src/features/posts/services/posts-api';
import Link from 'next/link';
import { REACTIONS, getReactionConfig } from './reaction-picker';

interface LikesModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function LikesModal({ postId, isOpen, onClose }: LikesModalProps) {
    const [likes, setLikes] = useState<LikeWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReactionType, setSelectedReactionType] = useState<ReactionType | 'ALL'>('ALL');

    useEffect(() => {
        if (isOpen && postId) {
            fetchLikes();
        }
    }, [isOpen, postId]);

    const fetchLikes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await postsApi.getPostLikes(postId);
            setLikes(response.likes);
        } catch (err) {
            console.error('Erreur lors du chargement des likes:', err);
            setError('Impossible de charger les réactions');
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les likes par type de réaction sélectionné
    const filteredLikes = useMemo(() => {
        if (selectedReactionType === 'ALL') return likes;
        return likes.filter(like => like.reaction_type === selectedReactionType);
    }, [likes, selectedReactionType]);

    // Compter le nombre de chaque type de réaction
    const reactionCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        likes.forEach(like => {
            counts[like.reaction_type] = (counts[like.reaction_type] || 0) + 1;
        });
        return counts;
    }, [likes]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Réactions
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs Section (filtrage par type de réaction) */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                        <div className="flex items-center gap-2 min-w-max">
                            {/* Tous */}
                            <button
                                onClick={() => setSelectedReactionType('ALL')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${selectedReactionType === 'ALL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Tous {likes.length}
                            </button>

                            {/* Chaque type de réaction */}
                            {REACTIONS.map((reaction) => {
                                const count = reactionCounts[reaction.type] || 0;
                                if (count === 0) return null; // Ne pas afficher si 0

                                return (
                                    <button
                                        key={reaction.type}
                                        onClick={() => setSelectedReactionType(reaction.type)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${selectedReactionType === reaction.type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <span className="text-sm">{reaction.emoji}</span>
                                        <span>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-sm text-gray-500">Chargement...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2">
                                <p className="text-sm text-red-600">{error}</p>
                                <button
                                    onClick={fetchLikes}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : filteredLikes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-sm text-gray-500">Aucune réaction pour cette catégorie</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredLikes.map((like) => {
                                    const reactionConfig = getReactionConfig(like.reaction_type);

                                    return (
                                        <Link
                                            key={like.profile_id}
                                            href={`/profile/${like.profile_id}`}
                                            onClick={onClose}
                                            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer group"
                                        >
                                            {/* Avatar avec badge de réaction */}
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={like.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${like.full_name}`}
                                                    alt={like.full_name}
                                                    className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover bg-gray-100 dark:bg-gray-800"
                                                />
                                                {/* Badge de réaction dynamique */}
                                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${reactionConfig.color} rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 text-sm`}>
                                                    {reactionConfig.emoji}
                                                </div>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                                                    {like.display_name || like.full_name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    @{like.username}
                                                </p>
                                            </div>

                                            {/* Time badge */}
                                            <div className="text-xs text-gray-400">
                                                {formatTimeAgo(like.created_at)}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Helper function pour formater le temps
function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'à l\'instant';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}j`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}sem`;
    return `${Math.floor(diffInWeeks / 4)}mois`;
}
