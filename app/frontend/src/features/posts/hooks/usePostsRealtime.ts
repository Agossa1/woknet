'use client';

import { useEffect } from 'react';
import { useSocket } from '@/src/infra/realtime/socket-provider';
import { useAppDispatch } from '@/src/store/hooks';
import { Post } from '@/src/features/posts/services/posts-types';

export const usePostsRealtime = () => {
    const { socket } = useSocket();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!socket) return;

        // Listen for new posts
        socket.on('new_post', (post: Post) => {
            dispatch({ type: 'posts/addNewPost', payload: post });
        });

        // Listen for likes (posts)
        socket.on('post_liked', (payload: { postId: string, liked: boolean, likesCount?: number }) => {
            dispatch({ type: 'posts/updatePostLike', payload });
        });

        // Listen for new comments
        socket.on('new_comment', (comment: any) => {
            dispatch({ type: 'comments/addCommentRealtime', payload: comment });
            // Optionally update post comment count if needed, but usually dispatching to comments is enough.
            // Actually, we should probably increment the post's comment count too in the post-slice.
            dispatch({ type: 'posts/incrementPostCommentsCount', payload: comment.post_id });
        });

        // Listen for comment likes
        socket.on('comment_liked', (payload: { commentId: string, liked: boolean, likesCount?: number, postId: string }) => {
            dispatch({ type: 'comments/updateCommentLikeRealtime', payload });
        });

        // Listen for follows
        socket.on('user_followed', (payload: { followerId: string, followingId: string }) => {
            dispatch({ type: 'follows/updateFollowStatusRealtime', payload: { ...payload, following: true } });
        });

        socket.on('user_unfollowed', (payload: { followerId: string, followingId: string }) => {
            dispatch({ type: 'follows/updateFollowStatusRealtime', payload: { ...payload, following: false } });
        });

        return () => {
            socket.off('new_post');
            socket.off('post_liked');
            socket.off('new_comment');
            socket.off('comment_liked');
            socket.off('user_followed');
            socket.off('user_unfollowed');
        };
    }, [socket, dispatch]);
};
