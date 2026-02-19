'use client';

import { useState } from 'react';
import { ThumbsUp, MoreHorizontal, Send, CornerDownRight } from 'lucide-react';
import { Comment } from '../services/comments-types';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { toggleCommentLikeThunk, createCommentThunk, fetchRepliesThunk } from '../services/comments-thunks';
import { selectProfileUser } from '@/src/features/profiles/services/profile-selectors';
import { useMentions } from '@/src/hooks/useMentions';
import { MentionDropdown } from '@/src/components/ui/MentionDropdown';

interface CommentItemProps {
    comment: Comment;
    isReply?: boolean;
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

export const CommentItem = ({ comment, isReply = false }: CommentItemProps) => {
    const dispatch = useAppDispatch();
    const profileUser = useAppSelector(selectProfileUser);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);

    const replies = useAppSelector((state) => state.comments.repliesByComment[comment.id] || []);
    const isLoadingReplies = useAppSelector((state) => state.comments.loading[comment.id]);

    const {
        mentionQuery,
        dropdownRect,
        handleTextChange,
        insertMention,
        textareaRef
    } = useMentions();

    const handleLike = () => {
        if (!profileUser?.user_id) return;
        dispatch(toggleCommentLikeThunk({ commentId: comment.id, profileId: profileUser.user_id }));
    };

    const handleReplyToggle = () => {
        if (!showReplyInput) {
            // Pre-fill mention if it's a reply to a reply or even a normal comment
            setReplyText(`@${comment.username || comment.full_name} `);
        }
        setShowReplyInput(!showReplyInput);
    };

    const handleShowReplies = () => {
        if (!showReplies && replies.length === 0) {
            dispatch(fetchRepliesThunk(comment.id));
        }
        setShowReplies(!showReplies);
    };

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !profileUser?.user_id) return;

        // If we are already a reply, we want our reply to be a sibling, not a child
        // This keeps the depth at 1 level for better UI, like LinkedIn/FB
        const targetParentId = comment.parent_id || comment.id;

        dispatch(createCommentThunk({
            post_id: comment.post_id,
            parent_id: targetParentId,
            content: replyText.trim(),
            profile_id: profileUser.user_id
        }));

        setReplyText("");
        setShowReplyInput(false);
        // If we replied to the top level, show replies of that top level
        // (If we were a reply, we already are in a shown thread hopefully)
        if (!comment.parent_id) {
            setShowReplies(true);
        }
    };

    const avatarSize = isReply ? "w-6 h-6" : "w-8 h-8";

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex gap-2 group w-full">
                <div className="flex flex-col items-center">
                    <img
                        src={comment.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.full_name}`}
                        alt={comment.full_name}
                        className={`${avatarSize} rounded-full flex-shrink-0 mt-1 cursor-pointer hover:opacity-80 transition`}
                    />
                    {isReply && <div className="w-px h-full bg-gray-200 dark:bg-gray-800 my-1" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl px-3 py-2 inline-block max-w-full transition-colors">
                        <div className="flex items-center justify-between gap-4 mb-0.5">
                            <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 cursor-pointer transition-colors truncate">
                                {comment.full_name}
                            </span>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                {formatTimeAgo(comment.created_at as string)}
                            </span>
                        </div>
                        {comment.headline && (
                            <p className="text-[10px] text-gray-400 line-clamp-1 mb-1 leading-tight">
                                {comment.headline}
                            </p>
                        )}
                        <p className="text-[13px] text-gray-800 dark:text-gray-200 break-words leading-normal">
                            {comment.content.split(' ').map((word, i) =>
                                word.startsWith('@') ? (
                                    <span key={i} className="text-blue-600 font-semibold hover:underline cursor-pointer">{word} </span>
                                ) : word + ' '
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] font-bold text-gray-500">
                        <button
                            onClick={handleLike}
                            className={`hover:text-blue-600 transition-colors ${comment.isLiked ? 'text-blue-600' : ''}`}
                        >
                            J'aime
                        </button>
                        <span>•</span>
                        <button
                            onClick={handleReplyToggle}
                            className={`hover:text-blue-600 transition-colors ${showReplyInput ? 'text-blue-600' : ''}`}
                        >
                            Répondre
                        </button>

                        {comment.likes_count > 0 && (
                            <div className="flex items-center gap-1 ml-auto bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-full px-1.5 py-0.5">
                                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <ThumbsUp size={8} className="text-white fill-current" />
                                </div>
                                <span className="text-[10px] tabular-nums">{comment.likes_count}</span>
                            </div>
                        )}
                    </div>

                    {/* Reply Input Form */}
                    {showReplyInput && (
                        <div className="flex gap-2 mt-3 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <img
                                src={profileUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser?.display_name || 'user'}`}
                                className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 mt-1"
                            />
                            <form onSubmit={handleReplySubmit} className="flex-1 relative">
                                <div className="space-y-1">
                                    <textarea
                                        ref={textareaRef}
                                        autoFocus
                                        rows={1}
                                        value={replyText}
                                        onChange={(e) => {
                                            const newText = e.target.value;
                                            setReplyText(newText);
                                            handleTextChange(newText, e.target.selectionStart || 0);
                                        }}
                                        onKeyUp={(e: any) => handleTextChange(replyText, e.target.selectionStart || 0)}
                                        placeholder={`Répondre à ${comment.full_name}...`}
                                        className="w-full pl-3 pr-10 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm resize-none overflow-hidden h-auto min-h-[32px]"
                                    />
                                    {mentionQuery !== null && (
                                        <MentionDropdown
                                            query={mentionQuery}
                                            anchorRect={dropdownRect}
                                            onSelect={(user: any) => {
                                                const newText = insertMention(user.username, replyText, textareaRef.current?.selectionStart || 0);
                                                setReplyText(newText);
                                                textareaRef.current?.focus();
                                            }}
                                        />
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={!replyText.trim()}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full disabled:opacity-30 transition-all"
                                >
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Nested Replies Section */}
                    {!isReply && (
                        <div className="mt-1">
                            {(comment.comments_count > 0 || replies.length > 0 || isLoadingReplies) && (
                                <button
                                    onClick={handleShowReplies}
                                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 py-2 transition-colors group/btn"
                                >
                                    <CornerDownRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                    {showReplies ? "Masquer les réponses" : `Afficher les réponses (${replies.length || comment.comments_count})`}
                                </button>
                            )}

                            {showReplies && (
                                <div className="space-y-4 mt-1 pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-1">
                                    {isLoadingReplies && replies.length === 0 ? (
                                        <div className="flex items-center gap-2 py-2">
                                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[11px] text-gray-400 italic">Chargement des réponses...</p>
                                        </div>
                                    ) : (
                                        replies.map((reply) => (
                                            <CommentItem key={reply.id} comment={reply} isReply={true} />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all h-fit self-start">
                    <MoreHorizontal size={16} className="text-gray-500" />
                </button>
            </div>
        </div>
    );
};
