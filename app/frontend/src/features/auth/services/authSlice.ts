import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./authTypes";
import { forgotPasswordThunk, initializeAuthThunk, loginThunk, logoutThunk, registerThunk, resendCodeOtpThunk, resetPasswordThunk, updatePasswordThunk, verifyAccountThunk, verifyOtpPasswordResetThunk, verifyResetTokenThunk, completeOnboardingThunk } from "./authThunks";


// 1. Définition de l'état initial et du type de l'état
interface AuthState {
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null,
    isAuthenticated: boolean,
    isVerified: boolean,


    // Etats d'interfaces 
    isLoading: boolean,
    error: string | null
    successMessage: string | null
}

// 2 Etat initial(Valeurs par défaut    )

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isVerified: false,
    isLoading: false,
    error: null,
    successMessage: null,
}

// 3. Création du slice avec les reducers et les actions
const authSlice = createSlice({
    name: "auth",
    initialState,

    // A. REDUCERS SYNCHRONES(Actions syndrones / manuelles)
    reducers: {
        // Action pour nettoyer les erreurs quand l'utilisateur change de page ou réessaye une action
        clearAuthMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },

        // Action pour mettre à jour le user manuellement si besoin

        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isVerified = action.payload.is_verified;
        }
    },

    // B. EXTRA REDUCERS POUR LES ACTIONS ASYNCHRONES (Thunks)

    extraReducers: (builder) => {
        builder

            ///=================== REGISTER Slices ===================
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = false;
                state.successMessage = "Inscription réussie ! Veuillez vérifier votre compte avec le code OTP envoyé à votre email ou téléphone.";
            })

            // =================== LOGIN Slices ===================

            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.isVerified = true;
                state.error = null;
                state.successMessage = "Connexion réussie !";
            })


            // =================== LOGOUT Slices ===================
            .addCase(logoutThunk.fulfilled, () => {
                return initialState; // Réinitialise l'état à l'état initial lors de la déconnexion
            })


            // =================== VERIFY ACCOUNT Slices ===================
            .addCase(verifyAccountThunk.fulfilled, (state) => {
                state.isLoading = false;
                if (state.user) {
                    state.user.is_verified = true;
                }
                state.isVerified = true;
                state.isAuthenticated = true;
                state.successMessage = "Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.";
            })


            // =================== RESEND CODE OTP Slices ===================

            .addCase(resendCodeOtpThunk.fulfilled, (state) => {
                state.isLoading = false;
                state.successMessage = "Code OTP renvoyé avec succès ! Veuillez vérifier votre email ou téléphone.";
            })


            // =================== FORGOT PASSWORD Slices ===================

            .addCase(forgotPasswordThunk.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.successMessage = action.payload.message || "Instructions de réinitialisation du mot de passe envoyées ! Veuillez vérifier votre email ou téléphone.";
            })

            // =================== RESET PASSWORD Slices ===================
            .addCase(resetPasswordThunk.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.successMessage = action.payload.message || "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.";
            })

            // =================== UPDATE PASSWORD Slices ===================

            .addCase(updatePasswordThunk.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.successMessage = action.payload.message || "Mot de passe mis à jour avec succès !";
            })

            // =================== VERIFY OTP PASSWORD RESET Slices ===================

            .addCase(verifyOtpPasswordResetThunk.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.successMessage = action.payload.message || "Code OTP vérifié avec succès ! Vous pouvez maintenant définir un nouveau mot de passe.";
            })

            // =================== VERIFY RESET TOKEN 
            .addCase(verifyResetTokenThunk.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.successMessage = action.payload.message || "Token de réinitialisation vérifié avec succès ! Vous pouvez maintenant définir un nouveau mot de passe.";

            })
            // =================== INITIALIZE SESSION ===================
            .addCase(initializeAuthThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.isVerified = action.payload.user.is_verified;
            })
            .addCase(initializeAuthThunk.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // =================== COMPLETE ONBOARDING ===================
            .addCase(completeOnboardingThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(completeOnboardingThunk.fulfilled, (state) => {
                state.isLoading = false;
                if (state.user) {
                    state.user.has_onboarded = true;
                }
                state.successMessage = "Profil complété avec succès !";
            })
            .addCase(completeOnboardingThunk.rejected, (state, action: any) => {
                state.isLoading = false;
                state.error = action.payload || "Échec de la complétion du profil";
            })
    }
})

// Export des actions
export const { clearAuthMessages, setUser } = authSlice.actions;

// Export du reducer
export default authSlice.reducer;