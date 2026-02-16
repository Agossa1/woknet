import { RootState } from "@/src/store/store";
import { createSelector } from "@reduxjs/toolkit";




const selectAuthSlice = (state: RootState) => state.auth;


// 2. Sélecteurs simples

export const selectAuthUser = (state: RootState) => selectAuthSlice(state).user;
export const selectIsAuthenticated = (state: RootState) => selectAuthSlice(state).isAuthenticated;
export const selectAuthLoading = (state: RootState) => selectAuthSlice(state).isLoading;
export const selectError = (state: RootState) => selectAuthSlice(state).error;
export const selectSuccessMessage = (state: RootState) => selectAuthSlice(state).successMessage;



export const selectIsUserVerified = createSelector(
    [selectAuthUser, selectIsAuthenticated],
    (user, isAuth) => isAuth && user?.is_verified
)