import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProfileData } from "./profile-types";
import { getProfileThunk, updateProfileThunk, getPublicProfileThunk } from "./profile-thunks";

// 1. Définition de l'état initial et du type de l'état
interface ProfileState {
    user: ProfileData | null,
    viewedProfile: ProfileData | null, // Profil actuellement visionné (public)
    isAuthenticated: boolean,
    isVerified: boolean,

    // Etats d'interfaces 
    isLoading: boolean,
    isViewedProfileLoading: boolean,
    error: string | null,
    successMessage: string | null
}

// 2 Etat initial (Valeurs par défaut)
const initialState: ProfileState = {
    user: null,
    viewedProfile: null,
    isAuthenticated: false,
    isVerified: false,
    isLoading: false,
    isViewedProfileLoading: false,
    error: null,
    successMessage: null,
}

// 3. Création du slice avec les reducers et les actions
const profileSlice = createSlice({
    name: "profile",
    initialState,

    // A. REDUCERS SYNCHRONES
    reducers: {
        clearProfileMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },

        setUserProfile: (state, action: PayloadAction<ProfileData>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        }
    },

    // B. EXTRA REDUCERS POUR LES ACTIONS ASYNCHRONES (Thunks)
    extraReducers: (builder) => {
        builder
            // =================== GET PROFILE ===================
            .addCase(getProfileThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProfileThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                state.successMessage = "Profile récupéré avec succès !";
            })
            .addCase(getProfileThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || "Échec de récupération du profil";
            })

            // =================== UPDATE PROFILE ===================
            .addCase(updateProfileThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProfileThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                state.successMessage = "Profile mis à jour avec succès !";
            })
            .addCase(updateProfileThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || "Échec de mise à jour du profil";
            })

            // =================== GET PUBLIC PROFILE ===================
            .addCase(getPublicProfileThunk.pending, (state) => {
                state.isViewedProfileLoading = true;
                state.error = null;
            })
            .addCase(getPublicProfileThunk.fulfilled, (state, action) => {
                state.isViewedProfileLoading = false;
                state.viewedProfile = action.payload.user;
                state.error = null;
            })
            .addCase(getPublicProfileThunk.rejected, (state, action) => {
                state.isViewedProfileLoading = false;
                state.error = action.payload as string || "Échec de récupération du profil public";
            })
    }
});

// Export des actions
export const { clearProfileMessages, setUserProfile } = profileSlice.actions;

// Export du reducer
export default profileSlice.reducer;