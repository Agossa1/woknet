import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PostsState, Post } from "./posts-types";
import {
    fetchFeedThunk,
    fetchProfilePostsThunk,
    createPostThunk,
    toggleLikeThunk,
    deletePostThunk
} from "./posts-thunks";

const initialState: PostsState = {
    feed: [],
    profilePosts: {},
    loading: false,
    error: null,
};

const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        clearPostsError: (state) => {
            state.error = null;
        },
        addNewPost: (state, action: PayloadAction<Post>) => {
            // Check if already exists to avoid duplicates (e.g. from the creator's own thunk)
            const exists = state.feed.some(p => p.id === action.payload.id);
            if (!exists) {
                state.feed.unshift(action.payload);
            }
        },
        updatePostLike: (state, action: PayloadAction<{ postId: string, liked: boolean, likesCount?: number }>) => {
            const { postId, liked, likesCount } = action.payload;

            // Update in feed
            const postInFeed = state.feed.find(p => p.id === postId);
            if (postInFeed && likesCount !== undefined) {
                postInFeed.likes_count = likesCount;
            }

            // Update in profile posts
            Object.values(state.profilePosts).forEach(posts => {
                const post = posts.find(p => p.id === postId);
                if (post && likesCount !== undefined) {
                    post.likes_count = likesCount;
                }
            });
        },
        incrementPostCommentsCount: (state, action: PayloadAction<string>) => {
            const postId = action.payload;

            // Update in feed
            const postInFeed = state.feed.find(p => p.id === postId);
            if (postInFeed) {
                postInFeed.comments_count += 1;
            }

            // Update in profile posts
            Object.values(state.profilePosts).forEach(posts => {
                const post = posts.find(p => p.id === postId);
                if (post) {
                    post.comments_count += 1;
                }
            });
        },
    },
    extraReducers: (builder) => {
        // Fetch Feed
        builder.addCase(fetchFeedThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchFeedThunk.fulfilled, (state, action: PayloadAction<Post[]>) => {
            state.loading = false;
            state.feed = action.payload;
        });
        builder.addCase(fetchFeedThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Profile Posts
        builder.addCase(fetchProfilePostsThunk.fulfilled, (state, action) => {
            state.profilePosts[action.payload.profileId] = action.payload.posts;
        });

        // Create Post
        builder.addCase(createPostThunk.fulfilled, (state, action: PayloadAction<Post>) => {
            const exists = state.feed.some(p => p.id === action.payload.id);
            if (!exists) {
                state.feed.unshift(action.payload);
            }
        });

        // Toggle Like
        builder.addCase(toggleLikeThunk.fulfilled, (state, action) => {
            const { postId, liked } = action.payload;

            // Update in feed
            const postInFeed = state.feed.find(p => p.id === postId);
            if (postInFeed) {
                postInFeed.isLiked = liked;
                postInFeed.likes_count += liked ? 1 : -1;
            }

            // Update in profile posts
            Object.values(state.profilePosts).forEach(posts => {
                const post = posts.find(p => p.id === postId);
                if (post) {
                    post.isLiked = liked;
                    post.likes_count += liked ? 1 : -1;
                }
            });
        });

        // Delete Post
        builder.addCase(deletePostThunk.fulfilled, (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            state.feed = state.feed.filter(p => p.id !== postId);
            Object.keys(state.profilePosts).forEach(profileId => {
                state.profilePosts[profileId] = state.profilePosts[profileId].filter(p => p.id !== postId);
            });
        });
    },
});

export const { clearPostsError, addNewPost, updatePostLike } = postsSlice.actions;
export default postsSlice.reducer;
