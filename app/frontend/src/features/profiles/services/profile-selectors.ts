import { RootState } from "@/src/store/store";
import { createSelector } from "@reduxjs/toolkit";
import { selectAuthUser } from "../../auth/services/authSelectors";

// 1. Sélecteur de base pour le slice profile
const selectProfileSlice = (state: RootState) => state.profile;

// 2. Sélecteurs simples (uniques au profile pour éviter les collisions)
export const selectProfileUser = (state: RootState) => selectProfileSlice(state).user;
export const selectViewedProfile = (state: RootState) => selectProfileSlice(state).viewedProfile;
export const selectProfileLoading = (state: RootState) => selectProfileSlice(state).isLoading;
export const selectIsViewedProfileLoading = (state: RootState) => selectProfileSlice(state).isViewedProfileLoading;
export const selectProfileError = (state: RootState) => selectProfileSlice(state).error;
export const selectProfileSuccessMessage = (state: RootState) => selectProfileSlice(state).successMessage;

// 3. Sélecteurs composés
export const selectIsProfileAuthenticated = (state: RootState) => selectProfileSlice(state).isAuthenticated;

export const selectIsUserVerified = createSelector(
    [selectAuthUser, selectIsProfileAuthenticated],
    (authUser, isAuth) => isAuth && authUser?.is_verified
);