import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "./comments-types";
import { fetchCommentsThunk, createCommentThunk, fetchRepliesThunk } from "./comments-thunks";

interface CommentsState {
    commentsByPost: Record<string, Comment[]>;
    repliesByComment: Record<string, Comment[]>;
    loading: Record<string, boolean>;
    error: string | null;
}

const initialState: CommentsState = {
    commentsByPost: {},
    repliesByComment: {},
    loading: {},
    error: null,
};

const commentsSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {
        addCommentRealtime: (state, action: PayloadAction<Comment>) => {
            const comment = action.payload;
            const postId = comment.post_id;
            const parentId = comment.parent_id;

            if (parentId) {
                // Update parent's comment count if it's in the main list
                if (state.commentsByPost[postId]) {
                    const parent = state.commentsByPost[postId].find(c => c.id === parentId);
                    if (parent) parent.comments_count += 1;
                }

                if (state.repliesByComment[parentId]) {
                    const exists = state.repliesByComment[parentId].some(c => c.id === comment.id);
                    if (!exists) state.repliesByComment[parentId].push(comment);
                } else {
                    state.repliesByComment[parentId] = [comment];
                }
            } else {
                if (state.commentsByPost[postId]) {
                    const exists = state.commentsByPost[postId].some(c => c.id === comment.id);
                    if (!exists) state.commentsByPost[postId].push(comment);
                } else {
                    state.commentsByPost[postId] = [comment];
                }
            }
        },
        removeCommentRealtime: (state, action: PayloadAction<{ id: string, postId: string, parentId?: string | null }>) => {
            const { id, postId, parentId } = action.payload;
            if (parentId && state.repliesByComment[parentId]) {
                state.repliesByComment[parentId] = state.repliesByComment[parentId].filter(c => c.id !== id);
            }
            if (state.commentsByPost[postId]) {
                state.commentsByPost[postId] = state.commentsByPost[postId].filter(c => c.id !== id);
            }
        },
        updateCommentLikeRealtime: (state, action: PayloadAction<{ commentId: string, liked: boolean, likesCount?: number, postId: string, parentId?: string | null }>) => {
            const { commentId, liked, likesCount, postId, parentId } = action.payload;

            const updateInList = (list: Comment[]) => {
                const comment = list.find(c => c.id === commentId);
                if (comment && likesCount !== undefined) {
                    comment.likes_count = likesCount;
                }
            };

            if (state.commentsByPost[postId]) {
                updateInList(state.commentsByPost[postId]);
            }
            if (parentId && state.repliesByComment[parentId]) {
                updateInList(state.repliesByComment[parentId]);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCommentsThunk.pending, (state, action) => {
                state.loading[action.meta.arg] = true;
            })
            .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
                state.loading[action.meta.arg] = false;
                state.commentsByPost[action.meta.arg] = action.payload;
            })
            .addCase(fetchCommentsThunk.rejected, (state, action) => {
                state.loading[action.meta.arg as string] = false;
                state.error = action.payload as string;
            })
            .addCase(createCommentThunk.fulfilled, (state, action) => {
                const comment = action.payload;
                const postId = comment.post_id;
                const parentId = comment.parent_id;

                if (parentId) {
                    if (state.repliesByComment[parentId]) {
                        const exists = state.repliesByComment[parentId].some(c => c.id === comment.id);
                        if (!exists) state.repliesByComment[parentId].push(comment);
                    } else {
                        state.repliesByComment[parentId] = [comment];
                    }
                } else {
                    if (state.commentsByPost[postId]) {
                        const exists = state.commentsByPost[postId].some(c => c.id === comment.id);
                        if (!exists) state.commentsByPost[postId].push(comment);
                    } else {
                        state.commentsByPost[postId] = [comment];
                    }
                }
            })
            .addCase(fetchRepliesThunk.pending, (state, action) => {
                state.loading[action.meta.arg] = true;
            })
            .addCase(fetchRepliesThunk.fulfilled, (state, action) => {
                state.loading[action.meta.arg] = false;
                state.repliesByComment[action.meta.arg] = action.payload;
            })
            .addCase(fetchRepliesThunk.rejected, (state, action) => {
                state.loading[action.meta.arg] = false;
                state.error = action.payload as string;
            });
    },
});

export const { addCommentRealtime, removeCommentRealtime, updateCommentLikeRealtime } = commentsSlice.actions;
export default commentsSlice.reducer;
