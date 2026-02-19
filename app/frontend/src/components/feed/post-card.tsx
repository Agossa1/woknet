'use client';

import { ThumbsUp, MessageSquare, Share2, Send, MoreHorizontal, Globe, Trash2, Heart, Edit2, Bookmark, AlertOctagon, Link2, UserMinus, Building2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/src/features/posts/services/posts-types';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { toggleLikeThunk, deletePostThunk, toggleSavePostThunk } from '@/src/features/posts/services/posts-thunks';
import { selectAuthUser } from '@/src/features/auth/services/authSelectors';
import { selectProfileUser } from '@/src/features/profiles/services/profile-selectors';
import { fetchCommentsThunk, createCommentThunk } from '@/src/features/comments/services/comments-thunks';
import { CommentItem } from '@/src/features/comments/components/comment-item';
import { toggleFollowThunk, checkFollowStatusThunk } from '@/src/features/follows/services/follows-thunks';
import { useEffect } from 'react';
import { trackSignalThunk } from '@/src/features/recommendations/services/recommendations-thunks';
import { VideoPlayer } from '@/src/components/ui/video-player';
import { sharePostThunk } from '@/src/features/shares/services/shares-thunks';
import { ShareModal } from './share-modal';
import LikesModal from './likes-modal';
import ReactionPicker, { getReactionConfig } from './reaction-picker';
import { ReactionType } from '@/src/features/posts/services/posts-types';
import EditPostModal from './edit-post-modal';
import PostDetailModal from './post-detail-modal';
import { formatTimeAgo } from '@/src/utils/date-utils';
import { POST_BACKGROUND_PRESETS } from '@/src/features/posts/services/posts-constants';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [commentText, setCommentText] = useState("");
    const dispatch = useAppDispatch();
    const authUser = useAppSelector(selectAuthUser);
    const profileUser = useAppSelector(selectProfileUser);

    const comments = useAppSelector((state) => state.comments.commentsByPost[post.id] || []);
    const isLoadingComments = useAppSelector((state) => state.comments.loading[post.id]);
    const isFollowing = useAppSelector((state) => state.follows.isFollowingMap[post.profile_id] || false);

    const isOwner = authUser?.id === post.profile_id;
    const isSharedPost = !!post.share_id;
    const isCompanyPost = !!post.company_id;

    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '';

    const authorLink = isCompanyPost
        ? `/companies/${post.username}`
        : `/profile/${isSharedPost ? post.original_author_id : post.profile_id}`;

    useEffect(() => {
        if (!isOwner && authUser?.id) {
            dispatch(checkFollowStatusThunk(post.profile_id));
        }
    }, [post.profile_id, authUser?.id, isOwner, dispatch]);

    const handleToggleComments = () => {
        if (!showComments) {
            dispatch(fetchCommentsThunk(post.id));
        }
        setShowComments(!showComments);
    };

    const handleLike = (reactionType?: ReactionType) => {
        if (!profileUser?.user_id) return;
        dispatch(toggleLikeThunk({
            postId: post.id,
            profileId: profileUser.user_id,
            reactionType: reactionType || ReactionType.LIKE
        }));

        // TRACKING: LIKE
        dispatch(trackSignalThunk({
            item_id: post.id,
            item_type: 'POST',
            action_type: 'LIKE',
            weight: reactionType === ReactionType.LOVE ? 8 : 5 // Plus de poids pour "Love"
        }));
    };

    const handleShare = (caption?: string) => {
        if (!profileUser?.user_id) return;
        dispatch(sharePostThunk({ postId: post.id, caption: caption || undefined }));
        setIsShareModalOpen(false); // Close modal after sharing
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !profileUser?.user_id) return;

        dispatch(createCommentThunk({
            post_id: post.id,
            content: commentText.trim(),
            profile_id: profileUser.user_id
        }));

        // TRACKING: COMMENT
        dispatch(trackSignalThunk({
            item_id: post.id,
            item_type: 'POST',
            action_type: 'COMMENT',
            weight: 10 // Très fort signal d'engagement
        }));

        setCommentText("");
    };

    // TRACKING: VIEW (Simple implementation on mount)
    useEffect(() => {
        // On simule une vue si le composant reste affiché plus de 2s
        const timer = setTimeout(() => {
            dispatch(trackSignalThunk({
                item_id: post.id,
                item_type: 'POST',
                action_type: 'VIEW',
                weight: 1
            }));
        }, 2000);
        return () => clearTimeout(timer);
    }, [post.id, dispatch]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDelete = () => {
        setIsMenuOpen(false);
        if (confirm("Voulez-vous vraiment supprimer ce post ?")) {
            dispatch(deletePostThunk(post.id));
        }
    };

    const copyPostLink = () => {
        navigator.clipboard.writeText(postUrl);
        alert("Lien copié dans le presse-papier !");
        setIsMenuOpen(false);
    };

    const handleToggleFollow = () => {
        if (!profileUser?.user_id) return;
        dispatch(toggleFollowThunk(post.profile_id));
        setIsMenuOpen(false);
    };

    const handleToggleSave = () => {
        dispatch(toggleSavePostThunk(post.id));
        setIsMenuOpen(false);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm mb-4 transition-all duration-200">
            {/* Share Header */}
            {isSharedPost && (
                <div className="px-4 pt-3 pb-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Share2 size={14} className="text-blue-500" />
                        <span className="font-bold text-gray-900 dark:text-gray-100 italic">{post.sharer_name}</span> a partagé cette publication
                    </div>
                    {post.share_caption && (
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic border-l-2 border-blue-500 pl-3 py-1 bg-blue-50/30 dark:bg-blue-900/10">
                            "{post.share_caption}"
                        </p>
                    )}
                </div>
            )}

            {/* Header */}
           <div className="p-4 flex justify-between items-start gap-3">
    <div className="flex items-center gap-3 flex-1 min-w-0">
        <Link href={authorLink} className="shrink-0">
            <img
                src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.full_name}`}
                className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-800 object-cover bg-gray-50 dark:bg-gray-800"
                alt={post.full_name}
                loading="lazy"
            />
        </Link>

        <div className="flex-1 min-w-0">
            {/* Ligne du haut : Nom + Entreprise + Date */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Link href={authorLink} className="hover:text-blue-600 hover:underline transition truncate">
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                            {isSharedPost ? post.original_author_name : post.full_name}
                        </span>
                    </Link>
                    
                    {isCompanyPost && !isSharedPost && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 shrink-0">
                            <Building2 size={13} className="opacity-70" />
                            Entreprise
                        </span>
                    )}

                    {!isOwner && authUser && !isSharedPost && (
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-gray-400 text-xs">•</span>
                            <button
                                onClick={() => dispatch(toggleFollowThunk(post.profile_id))}
                                className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 py-0.5 rounded transition"
                            >
                                {isFollowing ? "Suivi(e)" : "Suivre"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Date alignée à droite sur la même ligne */}
                <div className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0 ml-auto">
                    <span>{formatTimeAgo(post.created_at)}</span>
                    <span className="hidden sm:inline">•</span>
                    <Globe size={11} className="hidden sm:inline" />
                </div>
            </div>

            {/* Ligne du bas : Headline ou Infos Entreprise */}
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                {isCompanyPost
                    ? `${post.company_type || "Entreprise"} • ${post.company_size ? `${post.company_size} employés` : "Taille inconnue"}`
                    : post.headline}
            </p>
        </div>
    </div>

    {/* Menu à trois points */}
    <div className="relative shrink-0">
        <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition ${isMenuOpen ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : ''}`}
        >
            <MoreHorizontal size={20} />
        </button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                                {isOwner ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                                        >
                                            <Edit2 size={18} />
                                            Modifier le post
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition font-medium"
                                        >
                                            <Trash2 size={18} />
                                            Supprimer le post
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleToggleSave}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition font-medium ${post.isSaved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                        >
                                            <Bookmark size={18} className={post.isSaved ? 'fill-current' : ''} />
                                            {post.isSaved ? 'Enregistré' : 'Enregistrer pour plus tard'}
                                        </button>
                                        <button
                                            onClick={copyPostLink}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                                        >
                                            <Link2 size={18} />
                                            Copier le lien vers le post
                                        </button>
                                        {isFollowing && (
                                            <button
                                                onClick={handleToggleFollow}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                                            >
                                                <UserMinus size={18} />
                                                Ne plus suivre {post.full_name?.split(' ')[0]}
                                            </button>
                                        )}
                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium">
                                            <AlertOctagon size={18} />
                                            Signaler ce post
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Post Content */}
            {post.background_color && post.background_color !== 'none' ? (() => {
                const preset = POST_BACKGROUND_PRESETS.find(p => p.id === post.background_color);
                return (
                    <div
                        className={`h-[300px] flex items-center justify-center p-8 text-center cursor-pointer transition-transform hover:scale-[1.01] duration-500 overflow-hidden relative ${preset?.class || ''}`}
                        style={preset?.style || {}}
                        onClick={() => setIsDetailModalOpen(true)}
                    >
                        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                        <p className="text-2xl font-bold leading-snug break-words max-w-full z-10 drop-shadow-sm">
                            {post.content && post.content.split(/(\s+)/).map((part, i) => {
                                if (part.startsWith('#') && part.length > 1) {
                                    const hashtag = part.substring(1).replace(/[^\w]/g, '');
                                    return (
                                        <Link
                                            key={i}
                                            href={`/hashtag/${hashtag}`}
                                            className="text-white hover:underline drop-shadow-md"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {part}
                                        </Link>
                                    );
                                }
                                return part;
                            })}
                        </p>
                    </div>
                );
            })() : (
                <div className="px-4 pt-2 pb-3 cursor-pointer" onClick={() => setIsDetailModalOpen(true)}>
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${post.content && post.content.length < 100 && !post.media_url && (!post.media_urls || post.media_urls.length === 0) ? 'text-lg text-gray-900 dark:text-white font-medium' : 'text-gray-800 dark:text-gray-200'}`}>
                        {post.content && post.content.split(/(\s+)/).map((part, i) => {
                            if (part.startsWith('#') && part.length > 1) {
                                const hashtag = part.substring(1).replace(/[^\w]/g, '');
                                return (
                                    <Link
                                        key={i}
                                        href={`/hashtag/${hashtag}`}
                                        className="text-blue-600 dark:text-blue-300 font-semibold hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {part}
                                    </Link>
                                );
                            }
                            return part;
                        })}
                    </p>
                </div>
            )}

            {/* Post Media (Full-Bleed) */}
            {(post.media_urls && post.media_urls.length > 0) ? (
                <div
                    className={`w-full border-y border-gray-100 dark:border-gray-800 grid gap-0.5 bg-gray-100 dark:bg-gray-800 cursor-pointer ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
                    onClick={() => setIsDetailModalOpen(true)}
                >
                    {post.media_urls.slice(0, 4).map((url, idx) => (
                        <div
                            key={url}
                            className={`relative overflow-hidden ${post.media_urls!.length === 3 && idx === 0 ? 'row-span-2 h-full' : ' '
                                }`}
                        >
                            {post.type === 'IMAGE' ? (
                                <img
                                    src={url}
                                    alt={`Post content ${idx + 1}`}
                                    className="w-full h-full object-cover block"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : post.type === 'VIDEO' ? (
                                <VideoPlayer
                                    src={url}
                                    className="w-full h-full object-cover block"
                                    enableClickToPlay={false}
                                />
                            ) : null}

                            {/* Overlay pour le surplus d'images */}
                            {idx === 3 && post.media_urls!.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                                    +{post.media_urls!.length - 4}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : post.media_url && (
                <div className="w-full border-y border-gray-100 dark:border-gray-800 cursor-pointer" onClick={() => setIsDetailModalOpen(true)}>
                    {post.type === 'IMAGE' ? (
                        <img
                            src={post.media_url}
                            alt="Post content"
                            className="w-full h-auto block"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : post.type === 'VIDEO' ? (
                        <VideoPlayer
                            src={post.media_url}
                            className="w-full h-auto block"
                            enableClickToPlay={false}
                        />
                    ) : null}
                </div>
            )}

            {/* Post Stats */}
            {(post.likes_count > 0 ||
              post.comments_count > 0 ||
              post.shares_count > 0 ||
              post.type === 'VIDEO' ||
              post.type === 'IMAGE') && (
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div
                            className="flex items-center gap-1.5 cursor-pointer group"
                            onClick={() => setIsLikesModalOpen(true)}
                        >
                            {post.likes_count > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <div className="flex -space-x-1.5">
                                        {Array.isArray(post.reactionTypes) && post.reactionTypes.length > 0 ? (
                                            post.reactionTypes.slice(0, 3).map((type, index) => {
                                                const config = getReactionConfig(type);
                                                const Icon = config.icon;
                                                return (
                                                    <div
                                                        key={type}
                                                        className={`w-4 h-4 rounded-full ${config.color} flex items-center justify-center border border-white dark:border-gray-900`}
                                                        style={{ zIndex: 10 - index }}
                                                    >
                                                        <Icon size={10} className="text-white fill-current" />
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-white dark:border-gray-900 z-10">
                                                <ThumbsUp size={10} className="text-white fill-current" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="group-hover:text-blue-600 group-hover:underline transition">
                                        {post.likes_count}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {post.comments_count > 0 && <span className="hover:text-blue-600 hover:underline cursor-pointer" onClick={handleToggleComments}>{post.comments_count} commentaires</span>}
                            {post.shares_count > 0 && <span className="hover:text-blue-600 hover:underline cursor-pointer">{post.shares_count} partages</span>}
                            {(post.type === 'VIDEO' || post.type === 'IMAGE') && (
                                <span className="text-gray-500 dark:text-gray-400">
                                    {(post.views_count ?? 0)} vues
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="px-2 py-1 flex justify-between items-center">
                <div className="relative flex-1 group/like">
                    {/* Reaction Picker (Floating above) */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-max z-20 pointer-events-none group-hover/like:pointer-events-auto">
                        <ReactionPicker
                            onSelect={(type) => {
                                // Si on reclique sur la même réaction, on l'enlève (toggle off)
                                if (post.isLiked && post.reactionType === type) {
                                    handleLike();
                                } else {
                                    handleLike(type);
                                }
                            }}
                            currentReaction={post.reactionType}
                        />
                    </div>

                    <button
                        onClick={() => handleLike()}
                        className={`flex items-center justify-center gap-2 py-3 px-2 w-full rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 transform active:scale-95 text-sm font-semibold ${post.isLiked
                            ? getReactionConfig(post.reactionType || ReactionType.LIKE).textColor
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        {post.isLiked && post.reactionType ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                {(() => {
                                    const config = getReactionConfig(post.reactionType);
                                    const Icon = config.icon;
                                    return (
                                        <>
                                            <Icon size={20} className="fill-current" />
                                            <span className="hidden sm:inline">{config.label}</span>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <ThumbsUp size={18} className={post.isLiked ? "fill-current" : ""} />
                                <span className="hidden sm:inline">J'aime</span>
                            </div>
                        )}
                    </button>
                </div>

                <button
                    onClick={handleToggleComments}
                    className={`flex items-center justify-center gap-2 py-3 px-2 flex-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-semibold ${showComments ? 'text-blue-600 bg-gray-50 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400'}`}
                >
                    <MessageSquare size={18} className={showComments ? "fill-current" : ""} />
                    <span className="hidden sm:inline">Commenter</span>
                </button>
                <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-3 px-2 flex-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    <Share2 size={18} />
                    <span className="hidden sm:inline">Partager</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-2 flex-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                    <Send size={18} />
                    <span className="hidden sm:inline">Envoyer</span>
                </button>
            </div>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onInternalShare={handleShare}
                postUrl={postUrl}
                postContent={post.content}
            />

            <LikesModal
                isOpen={isLikesModalOpen}
                onClose={() => setIsLikesModalOpen(false)}
                postId={post.id}
            />

            {/* Comment Section */}
            {showComments && (
                <div className="bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-3 mb-6">
                        <img
                            src={profileUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.full_name}`}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 dark:border-gray-700"
                            alt="My Avatar"
                        />
                        <div className="flex-1">
                            <form onSubmit={handleCommentSubmit} className="relative">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Ajouter un commentaire..."
                                    className="w-full pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition"
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim()}
                                    className="absolute right-1.5 top-1.5 p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <Send size={12} className="ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLoadingComments && comments.length === 0 ? (
                            <p className="text-center text-xs text-gray-400 italic py-2">Chargement des commentaires...</p>
                        ) : comments.length > 0 ? (
                            comments.map((comment) => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))
                        ) : (
                            <p className="text-center text-xs text-gray-400 italic py-2">Soyez le premier à commenter ce post.</p>
                        )}
                    </div>
                </div>
            )}
            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
                userAvatar={post.avatar_url}
                userName={post.display_name || post.full_name}
            />
            {isDetailModalOpen && (
                <PostDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    post={post}
                />
            )}
        </div>
    );
}
