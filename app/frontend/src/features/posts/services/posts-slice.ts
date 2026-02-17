import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PostsState, Post } from "./posts-types";
import {
    fetchFeedThunk,
    fetchProfilePostsThunk,
    fetchCompanyPostsThunk,
    createPostThunk,
    toggleLikeThunk,
    deletePostThunk,
    updatePostThunk,
    toggleSavePostThunk,
    fetchSavedPostsThunk
} from "./posts-thunks";
import { RootState } from "@/src/store/store";

const initialState: PostsState = {
    feed: [],
    profilePosts: {},
    companyPosts: {},
    savedPosts: [],
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
            // Check if already exists to avoid duplicates
            const exists = state.feed.some(p => p.id === action.payload.id);
            if (!exists) {
                state.feed.unshift(action.payload);
            }
            // If company post, add to company posts
            if (action.payload.company_id) {
                if (!state.companyPosts[action.payload.company_id]) {
                    state.companyPosts[action.payload.company_id] = [];
                }
                state.companyPosts[action.payload.company_id].unshift(action.payload);
            }
            // If user post, add to profile posts
            else if (action.payload.profile_id) {
                if (!state.profilePosts[action.payload.profile_id]) {
                    state.profilePosts[action.payload.profile_id] = [];
                }
                state.profilePosts[action.payload.profile_id].unshift(action.payload);
            }
        },
        updatePostLike: (state, action: PayloadAction<{ postId: string, liked: boolean, likesCount?: number, reactionType?: any, reactionTypes?: any[] }>) => {
            const { postId, liked, likesCount, reactionType, reactionTypes } = action.payload;

            const updateInList = (posts: Post[]) => {
                const post = posts.find(p => p.id === postId);
                if (post) {
                    if (likesCount !== undefined) post.likes_count = likesCount;
                    post.isLiked = liked;
                    post.reactionType = liked ? reactionType : undefined;
                    if (reactionTypes) post.reactionTypes = reactionTypes;
                }
            };

            updateInList(state.feed);
            updateInList(state.savedPosts);
            Object.values(state.profilePosts).forEach(updateInList);
            Object.values(state.companyPosts).forEach(updateInList);
        },
        incrementPostCommentsCount: (state, action: PayloadAction<string>) => {
            const postId = action.payload;

            const updateInList = (posts: Post[]) => {
                const post = posts.find(p => p.id === postId);
                if (post) {
                    post.comments_count += 1;
                }
            };

            updateInList(state.feed);
            updateInList(state.savedPosts);
            Object.values(state.profilePosts).forEach(updateInList);
            Object.values(state.companyPosts).forEach(updateInList);
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

        // Fetch Company Posts
        builder.addCase(fetchCompanyPostsThunk.fulfilled, (state, action) => {
            state.companyPosts[action.payload.companyId] = action.payload.posts;
        });

        // Create Post
        builder.addCase(createPostThunk.fulfilled, (state, action: PayloadAction<Post>) => {
            const exists = state.feed.some(p => p.id === action.payload.id);
            if (!exists) {
                state.feed.unshift(action.payload);
            }
            if (action.payload.company_id) {
                if (!state.companyPosts[action.payload.company_id]) {
                    state.companyPosts[action.payload.company_id] = [];
                }
                state.companyPosts[action.payload.company_id].unshift(action.payload);
            }
            else if (action.payload.profile_id) {
                if (!state.profilePosts[action.payload.profile_id]) {
                    state.profilePosts[action.payload.profile_id] = [];
                }
                state.profilePosts[action.payload.profile_id].unshift(action.payload);
            }
        });

        // Toggle Like
        builder.addCase(toggleLikeThunk.pending, (state, action) => {
            const { postId, reactionType } = action.meta.arg;

            const updatePost = (post: Post) => {
                const wasAlreadyLiked = post.isLiked;
                if (!wasAlreadyLiked) {
                    post.likes_count += 1;
                    post.isLiked = true;
                }
                post.reactionType = (reactionType || 'LIKE') as any;
            };

            const postInFeed = state.feed.find(p => p.id === postId);
            if (postInFeed) updatePost(postInFeed);

            Object.values(state.profilePosts).forEach(posts => {
                const post = posts.find(p => p.id === postId);
                if (post) updatePost(post);
            });
            Object.values(state.companyPosts).forEach(posts => {
                const post = posts.find(p => p.id === postId);
                if (post) updatePost(post);
            });
        });

        builder.addCase(toggleLikeThunk.fulfilled, (state, action) => {
            const { postId, liked, reactionType } = action.payload;

            const syncPost = (post: Post) => {
                post.isLiked = liked;
                post.reactionType = liked ? (reactionType as any) : undefined;
            };

            const postInFeed = state.feed.find(p => p.id === postId);
            if (postInFeed) syncPost(postInFeed);

            Object.values(state.profilePosts).forEach(posts => {
                const post = posts.find(p => p.id === postId);
                if (post) syncPost(post);
            });
            Object.values(state.companyPosts).forEach(posts => {
                const post = posts.find(p => p.id === postId);
                if (post) syncPost(post);
            });
        });

        // Delete Post
        builder.addCase(deletePostThunk.fulfilled, (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            state.feed = state.feed.filter(p => p.id !== postId);
            state.savedPosts = state.savedPosts.filter(p => p.id !== postId);
            Object.keys(state.profilePosts).forEach(profileId => {
                state.profilePosts[profileId] = state.profilePosts[profileId].filter(p => p.id !== postId);
            });
            Object.keys(state.companyPosts).forEach(companyId => {
                state.companyPosts[companyId] = state.companyPosts[companyId].filter(p => p.id !== postId);
            });
        });

        // Update Post
        builder.addCase(updatePostThunk.fulfilled, (state, action: PayloadAction<Post>) => {
            const updatedPost = action.payload;

            const updateInList = (posts: Post[]) => {
                const index = posts.findIndex(p => p.id === updatedPost.id);
                if (index !== -1) {
                    posts[index] = { ...posts[index], ...updatedPost };
                }
            };

            updateInList(state.feed);
            updateInList(state.savedPosts);
            Object.values(state.profilePosts).forEach(updateInList);
            Object.values(state.companyPosts).forEach(updateInList);
        });

        // Toggle Save Post
        builder.addCase(toggleSavePostThunk.fulfilled, (state, action) => {
            const { postId, saved } = action.payload;

            const updateInList = (posts: Post[]) => {
                const post = posts.find(p => p.id === postId);
                if (post) {
                    post.isSaved = saved;
                }
            };

            updateInList(state.feed);
            updateInList(state.savedPosts);
            Object.values(state.profilePosts).forEach(updateInList);
            Object.values(state.companyPosts).forEach(updateInList);

            if (!saved) {
                state.savedPosts = state.savedPosts.filter(p => p.id !== postId);
            }
        });

        // Fetch Saved Posts
        builder.addCase(fetchSavedPostsThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchSavedPostsThunk.fulfilled, (state, action: PayloadAction<Post[]>) => {
            state.loading = false;
            state.savedPosts = action.payload.map(p => ({ ...p, isSaved: true }));
        });
        builder.addCase(fetchSavedPostsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearPostsError, addNewPost, updatePostLike } = postsSlice.actions;

const EMPTY_POSTS: Post[] = [];

export const selectCompanyPosts = (state: RootState, companyId?: string) =>
    (companyId ? state.posts.companyPosts[companyId] : undefined) || EMPTY_POSTS;

export default postsSlice.reducer;
