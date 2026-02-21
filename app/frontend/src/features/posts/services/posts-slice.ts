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
import { fetchPowerFeedThunk } from "@/src/features/feeds/services/feed-thunks";
import { RootState } from "@/src/store/store";

const initialState: PostsState = {
    feed: [],
    feedPage: 1,
    hasMoreFeed: true,
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

        builder.addCase(fetchPowerFeedThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchPowerFeedThunk.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.error = null;

            const payload = action.payload as any;
            const page = payload?.page ?? 1;
            const rawItems = Array.isArray(payload?.items) ? payload.items : [];

            state.feedPage = page;
            state.hasMoreFeed = payload?.hasMore ?? (rawItems.length > 0);

            // Page 1 vide : on met à jour le feed à [] pour refléter l'état réel (éviter affichage stale).
            if ((page === 1 || !page) && rawItems.length === 0) {
                state.feed = [];
                return;
            }

            // On ne filtre PLUS les recommandations !
            const items = (rawItems as any[]);

            if (page && page > 1 && state.feed && state.feed.length > 0) {
                const existingIds = new Set(
                    state.feed.map((p: any) => p.id ?? p.item_id)
                );

                const newItems = (items as any[]).filter((p: any) => {
                    const id = p.id ?? p.item_id;
                    if (!id) return true;
                    if (existingIds.has(id)) return false;
                    existingIds.add(id);
                    return true;
                });

                state.feed = [...state.feed, ...newItems];
            } else {
                const newItems = items as any[];
                // On garde les recommandations existantes si elles sont là, sinon on les écrase
                const existing = (state.feed || []);

                if (existing.length === 0) {
                    state.feed = newItems;
                    return;
                }

                const newIds = new Set(
                    newItems.map((p: any) => p.id ?? p.item_id ?? p.unique_id)
                );

                const preservedExisting = existing.filter((p: any) => {
                    const id = p.id ?? p.item_id ?? p.unique_id;
                    if (!id) return false;
                    return !newIds.has(id);
                });

                state.feed = [...preservedExisting, ...newItems];
            }
        });
        builder.addCase(fetchPowerFeedThunk.rejected, (state, action) => {
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
