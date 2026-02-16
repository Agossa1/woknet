'use client';

import { ThumbsUp, MessageSquare, Share2, Send, MoreHorizontal, Globe, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/src/features/posts/services/posts-types';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { toggleLikeThunk, deletePostThunk } from '@/src/features/posts/services/posts-thunks';
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

interface PostCardProps {
  post: Post;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}j`;
  return date.toLocaleDateString();
};

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const profileUser = useAppSelector(selectProfileUser);

  const comments = useAppSelector((state) => state.comments.commentsByPost[post.id] || []);
  const isLoadingComments = useAppSelector((state) => state.comments.loading[post.id]);
  const isFollowing = useAppSelector((state) => state.follows.isFollowingMap[post.profile_id] || false);

  const isOwner = authUser?.id === post.profile_id;
  const isSharedPost = !!post.share_id;

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${post.id}` : '';

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

  const handleLike = () => {
    if (!profileUser?.user_id) return;
    dispatch(toggleLikeThunk({ postId: post.id, profileId: profileUser.user_id }));

    // TRACKING: LIKE
    dispatch(trackSignalThunk({
      item_id: post.id,
      item_type: 'POST',
      action_type: 'LIKE',
      weight: 5 // Fort signal d'intérêt
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

  const handleDelete = () => {
    if (confirm("Voulez-vous vraiment supprimer ce post ?")) {
      dispatch(deletePostThunk(post.id));
    }
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

      {/* Post Header */}
      <div className={`p-4 ${isSharedPost ? 'mt-1 opacity-90 scale-[0.98] border border-gray-100 dark:border-gray-800 rounded-lg mx-4 bg-gray-50/50 dark:bg-white/5' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <Link href={`/profile/${isSharedPost ? post.original_author_id : post.profile_id}`}>
              <img
                src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.full_name}`}
                alt={post.full_name}
                className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-800 bg-gray-50 hover:opacity-90 transition-opacity"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/${isSharedPost ? post.original_author_id : post.profile_id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm hover:text-blue-600 hover:underline cursor-pointer transition-colors">
                    {isSharedPost ? post.original_author_name : post.full_name}
                  </h3>
                </Link>
                {!isOwner && authUser && !isSharedPost && (
                  <>
                    <span className="text-gray-400 text-[10px]">•</span>
                    <button
                      onClick={() => dispatch(toggleFollowThunk(post.profile_id))}
                      className={`text-xs font-bold hover:underline transition-colors ${isFollowing ? 'text-gray-400' : 'text-blue-600'
                        }`}
                    >
                      {isFollowing ? "Suivi(e)" : "Suivre"}
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {post.headline}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <span>{formatTimeAgo(post.created_at)}</span>
                <span>•</span>
                <Globe size={12} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && !isSharedPost && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full transition"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="pt-3 pb-2">
          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
            {post.content && post.content.split(/(\s+)/).map((part, i) => {
              if (part.startsWith('#') && part.length > 1) {
                const hashtag = part.substring(1).replace(/[^\w]/g, '');
                return (
                  <Link
                    key={i}
                    href={`/hashtag/${hashtag}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    {part}
                  </Link>
                );
              }
              return part;
            })}
          </p>
        </div>

      </div>

      {/* Post Media (Full-Bleed) */}
      {post.media_url && (
        <div className="w-full border-y border-gray-100 dark:border-gray-800">
          {post.type === 'IMAGE' ? (
            <img
              src={post.media_url}
              alt="Post content"
              className="w-full h-auto block"
            />
          ) : post.type === 'VIDEO' ? (
            <VideoPlayer
              src={post.media_url}
              className="w-full h-auto block"
            />
          ) : null}
        </div>
      )}

      {/* Post Stats */}
      {(post.likes_count > 0 || post.comments_count > 0 || post.shares_count > 0) && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              {post.likes_count > 0 && (
                <>
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <ThumbsUp size={10} className="text-white fill-current" />
                    </div>
                  </div>
                  <span className="hover:text-blue-600 hover:underline cursor-pointer">{post.likes_count}</span>
                </>
              )}
            </div>
            <div className="flex gap-3">
              {post.comments_count > 0 && <span className="hover:text-blue-600 hover:underline cursor-pointer" onClick={handleToggleComments}>{post.comments_count} commentaires</span>}
              {post.shares_count > 0 && <span className="hover:text-blue-600 hover:underline cursor-pointer">{post.shares_count} partages</span>}
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-2 py-1 flex justify-between items-center">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 py-3 px-2 flex-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-semibold ${post.isLiked ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <ThumbsUp size={18} className={post.isLiked ? "fill-current" : ""} />
          <span className="hidden sm:inline">J'aime</span>
        </button>
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

      {/* Comment Section */}
      {showComments && (
        <div className="bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex gap-3 mb-6">
            <img
              src={profileUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.full_name}`}
              className="w-8 h-8 rounded-full bg-white border border-gray-200 dark:border-gray-700"
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
    </div>
  );
}
