import { RootState } from "@/src/store/store";

// Sélecteur de base
export const selectPostsState = (state: RootState) => state.posts;

// Sélecteur pour la liste des posts du feed
export const selectFeedItems = (state: RootState) => state.posts.feed;

// Sélecteur pour l'état de chargement
export const selectFeedLoading = (state: RootState) => state.posts.loading;

// Sélecteur pour l'erreur éventuelle
export const selectFeedError = (state: RootState) => state.posts.error;