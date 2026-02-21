'use client';

import { X, MessageCircle, Share2, ChevronLeft, ChevronRight, Send, UserPlus, ThumbsUp, Repeat, Navigation } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { Post, ReactionType } from "@/src/features/posts/services/posts-types";
import { VideoPlayer } from "@/src/components/ui/video-player";
import { fetchCommentsThunk, createCommentThunk } from "@/src/features/comments/services/comments-thunks";
import { formatTimeAgo } from "../../utils/date-utils";
import { POST_BACKGROUND_PRESETS } from "@/src/features/posts/services/posts-constants";
import { selectProfileUser } from "@/src/features/profiles/services/profile-selectors";
import ReactionPicker, { getReactionConfig } from "./reaction-picker";
import { toggleLikeThunk } from "@/src/features/posts/services/posts-thunks";
import { trackSignalThunk } from "@/src/features/recommendations/services/recommendations-thunks";
import { sharePostThunk } from "@/src/features/shares/services/shares-thunks";
import { ShareModal } from "./share-modal";
import LikesModal from "./likes-modal";
import { CommentItem } from "@/src/features/comments/components/comment-item";
import { toggleFollowThunk, checkFollowStatusThunk } from "@/src/features/follows/services/follows-thunks";

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
}

export default function PostDetailModal({ isOpen, onClose, post }: PostDetailModalProps) {
    const dispatch = useAppDispatch();

    // State
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [commentContent, setCommentContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);

    // Selectors
    const profile = useAppSelector(selectProfileUser);
    const authUser = useAppSelector(state => state.auth.user);
    const comments = useAppSelector(state => state.comments.commentsByPost[post.id] || []);
    const loadingComments = useAppSelector(state => state.comments.loading[post.id]);
    const isFollowing = useAppSelector((state) => state.follows.isFollowingMap[post.profile_id] || false);

    // Derived values
    const isOwner = useMemo(() => authUser?.id === post.profile_id, [authUser?.id, post.profile_id]);
    const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '';
    const mediaUrls = useMemo(() => {
        if (post.media_urls && post.media_urls.length > 0) return post.media_urls;
        return post.media_url ? [post.media_url] : [];
    }, [post.media_urls, post.media_url]);

    useEffect(() => {
        if (isOpen && post.id) {
            dispatch(fetchCommentsThunk(post.id));
            if (!isOwner && authUser?.id) {
                dispatch(checkFollowStatusThunk(post.profile_id));
            }
        }
    }, [isOpen, post.id, authUser?.id, isOwner, post.profile_id, dispatch]);

    if (!isOpen) return null;

    // Handlers
    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMediaIndex((prev) => (prev + 1) % mediaUrls.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMediaIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    };

    const handleLike = (reactionType?: ReactionType) => {
        if (!profile?.user_id) return;
        dispatch(toggleLikeThunk({
            postId: post.id,
            profileId: profile.user_id,
            reactionType: reactionType || ReactionType.LIKE
        }));

        dispatch(trackSignalThunk({
            item_id: post.id,
            item_type: 'POST',
            action_type: 'LIKE',
            weight: reactionType === ReactionType.LOVE ? 8 : 5
        }));
    };

    const handleShare = (caption?: string) => {
        if (!profile?.user_id) return;
        dispatch(sharePostThunk({ postId: post.id, caption: caption || undefined }));
        setIsShareModalOpen(false);
    };

    const handleToggleFollow = () => {
        if (!authUser?.id || isOwner) return;
        dispatch(toggleFollowThunk(post.profile_id));
    };

    const handleSendComment = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const profileId = profile?.user_id || authUser?.id;
        if (!commentContent.trim() || !profileId) return;

        setIsSubmitting(true);
        try {
            await dispatch(createCommentThunk({
                post_id: post.id,
                profile_id: profileId,
                content: commentContent.trim()
            })).unwrap();
            setCommentContent("");
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300 p-0 lg:p-8">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[130] p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition lg:hidden"
            >
                <X size={24} />
            </button>

            <div className="flex flex-col lg:flex-row w-full h-full lg:max-w-7xl lg:h-full bg-white dark:bg-gray-900 overflow-hidden lg:rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-300">
                {/* Left Side: Media Section */}
                <div className="relative flex-[1.4] bg-[#1a1a1a] flex items-center justify-center min-h-[40vh] lg:min-h-0 group">
                    {mediaUrls.length > 0 ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {post.type === 'VIDEO' ? (
                                <VideoPlayer
                                    src={mediaUrls[currentMediaIndex]}
                                    className="max-w-full max-h-full"
                                    autoPlayOnMount
                                />
                            ) : (
                                <img
                                    src={mediaUrls[currentMediaIndex]}
                                    alt="Post detail"
                                    className="max-w-full max-h-full object-contain hover:scale-[1.01] transition-transform duration-500"
                                />
                            )}
                            {mediaUrls.length > 1 && (
                                <>
                                    <button onClick={handlePrev} className="absolute left-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition opacity-0 group-hover:opacity-100">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button onClick={handleNext} className="absolute right-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition opacity-0 group-hover:opacity-100">
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                            {mediaUrls.length > 1 && (
                                <div className="absolute top-6 right-6 px-3 py-1 bg-black/50 text-white text-[10px] font-bold rounded-full border border-white/20">
                                    {currentMediaIndex + 1} / {mediaUrls.length}
                                </div>
                            )}
                        </div>
                    ) : post.background_color && post.background_color !== 'none' ? (() => {
                        const preset = POST_BACKGROUND_PRESETS.find(p => p.id === post.background_color);
                        return (
                            <div
                                className={`w-full h-full flex items-center justify-center p-12 text-center relative ${preset?.class || ''}`}
                                style={preset?.style || {}}
                            >
                                <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                                <p className="text-3xl font-bold leading-tight drop-shadow-sm z-10 max-w-2xl text-center">
                                    {post.content}
                                </p>
                            </div>
                        );
                    })() : (
                        <div className="text-gray-500 font-medium italic">Aucun média à afficher</div>
                    )}
                </div>

                {/* Right Side: Interactivity Section */}
                <div className="w-full lg:w-[450px] flex flex-col bg-white dark:bg-gray-900 shadow-xl z-20 border-l border-gray-100 dark:border-gray-800">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.full_name}`}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                                alt={post.full_name}
                            />
                            <div>
                                <div className="flex items-center gap-1.5 line-clamp-1">
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:text-blue-600 transition cursor-pointer">{post.full_name}</h3>
                                    <span className="text-[10px] text-gray-400">• 2e</span>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{post.headline}</p>
                                {post.industry_label && (
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-1">{post.industry_label}</p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-0.5">{formatTimeAgo(post.created_at)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {!isOwner && (
                                <button
                                    onClick={handleToggleFollow}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition text-sm font-bold ${isFollowing ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                                >
                                    {isFollowing ? 'Suivi' : <><UserPlus size={18} />Suivre</>}
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500 hidden lg:flex">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-gray-900">
                        {(!post.background_color || post.background_color === 'none' || mediaUrls.length > 0) && (
                            <p className="text-[14px] text-gray-800 dark:text-gray-200 leading-normal whitespace-pre-line mb-4 transition-all">
                                {post.content}
                            </p>
                        )}

                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 mb-2">
                            <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setIsLikesModalOpen(true)}>
                                {post.likes_count > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex -space-x-1.5">
                                            {Array.isArray(post.reactionTypes) && post.reactionTypes.length > 0 ? (
                                                post.reactionTypes.slice(0, 3).map((type, index) => {
                                                    const config = getReactionConfig(type);
                                                    const Icon = config.icon;
                                                    return (
                                                        <div key={type} className={`w-4 h-4 rounded-full ${config.color} flex items-center justify-center border border-white dark:border-gray-900`} style={{ zIndex: 10 - index }}>
                                                            <Icon size={10} className="text-white fill-current" />
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-white dark:border-gray-900"><ThumbsUp size={10} className="text-white fill-current" /></div>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-gray-500 group-hover:text-blue-600 group-hover:underline transition">{post.likes_count}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                {post.comments_count > 0 && <span className="hover:text-blue-600 hover:underline cursor-pointer">{post.comments_count} commentaires</span>}
                                {post.shares_count > 0 && <span className="hover:text-blue-600 hover:underline cursor-pointer">{post.shares_count} partages</span>}
                            </div>
                        </div>

                        <div className="flex items-center justify-around py-1 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <div className="relative group/like flex-1">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-max z-20 pointer-events-none group-hover/like:pointer-events-auto pb-2 animate-in slide-in-from-bottom-2 duration-200">
                                    <ReactionPicker
                                        onSelect={(type) => post.isLiked && post.reactionType === type ? handleLike() : handleLike(type)}
                                        currentReaction={post.reactionType}
                                    />
                                </div>
                                <button onClick={() => handleLike()} className={`flex flex-col lg:flex-row items-center justify-center gap-1.5 w-full py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 font-semibold text-xs active:scale-95 ${post.isLiked ? getReactionConfig(post.reactionType || ReactionType.LIKE).textColor : 'text-gray-600 dark:text-gray-400'}`}>
                                    {post.isLiked && post.reactionType ? (
                                        (() => {
                                            const config = getReactionConfig(post.reactionType);
                                            const Icon = config.icon;
                                            return <><Icon size={18} className="fill-current animate-in zoom-in duration-300" /><span>{config.label}</span></>;
                                        })()
                                    ) : <><ThumbsUp size={18} /><span>J'aime</span></>}
                                </button>
                            </div>
                            <button className="flex flex-col lg:flex-row items-center justify-center gap-1.5 flex-1 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-semibold text-xs"><MessageCircle size={18} /><span>Commenter</span></button>
                            <button onClick={() => setIsShareModalOpen(true)} className="flex flex-col lg:flex-row items-center justify-center gap-1.5 flex-1 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-semibold text-xs"><Repeat size={18} /><span>Republier</span></button>
                            <button className="flex flex-col lg:flex-row items-center justify-center gap-1.5 flex-1 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-semibold text-xs"><Send size={18} /><span>Envoyer</span></button>
                        </div>

                        <div className="flex gap-3 mb-6">
                            <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.full_name || 'User'}`} className="w-9 h-9 rounded-full bg-gray-100 object-cover shrink-0 border border-gray-100 dark:border-gray-800" alt="You" />
                            <div className="flex-1">
                                <form onSubmit={handleSendComment} className="relative">
                                    <input type="text" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Ajouter un commentaire..." className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full py-2 px-4 pr-10 text-sm text-gray-900 dark:text-white transition-all shadow-sm" />
                                    <button type="submit" disabled={!commentContent.trim() || isSubmitting} className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-30 disabled:cursor-not-allowed"><Send size={12} className="ml-0.5" /></button>
                                </form>
                            </div>
                        </div>

                        <div className="space-y-4 pb-20">
                            {loadingComments && comments.length === 0 ? (
                                <div className="text-center py-4"><div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div><p className="text-[11px] text-gray-500 mt-2">Chargement des commentaires...</p></div>
                            ) : comments.length > 0 ? comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
                                : <div className="text-center py-8"><div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400"><MessageCircle size={18} /></div><p className="text-[11px] text-gray-500 italic">Soyez le premier à commenter ce post.</p></div>}
                        </div>
                    </div>

                    <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onInternalShare={handleShare} postUrl={postUrl} postContent={post.content} />
                    <LikesModal isOpen={isLikesModalOpen} onClose={() => setIsLikesModalOpen(false)} postId={post.id} />
                </div>
            </div>
        </div>
    );
}
