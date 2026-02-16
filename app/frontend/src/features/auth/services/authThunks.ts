import { createAsyncThunk } from "@reduxjs/toolkit";
import { authServices } from "./authApi";
import { ApiError } from "../../api/apiClients";
import { createUserDto, forgotPasswordDto, loginUserDto, OnboardingDto, resendCodeOtpDto, resetPasswordDto, updatePassword, User, verifyAccountDto } from "./authTypes";

export const registerThunk = createAsyncThunk<{ user: User }, createUserDto>(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authServices.register(userData);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de l'inscription");
            }
            return rejectWithValue("Échec de l'inscription");
        }
    }
);


export const loginThunk = createAsyncThunk<{ user: User }, loginUserDto>(
    "auth/login",
    async (credential, { rejectWithValue }) => {
        try {
            const response = await authServices.login(credential);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la connexion");
            }
            return rejectWithValue("Échec de la connexion");
        }
    }
)

export const logoutThunk = createAsyncThunk<void, void>(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await authServices.logout();

        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la déconnexion");
            }
            return rejectWithValue("Échec de la déconnexion");
        }
    }
)


export const verifyAccountThunk = createAsyncThunk<{ user: User }, verifyAccountDto>(
    "auth/verifyAccount",
    async (verifyAccountData, { rejectWithValue }) => {
        try {
            const response = await authServices.verifyAccount(verifyAccountData);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la vérification du compte");
            }
            return rejectWithValue("Échec de la vérification du compte");
        }
    }
)


export const resendCodeOtpThunk = createAsyncThunk<{ user: User }, resendCodeOtpDto>(
    "auth/resendCodeOtp",
    async (resendCodeOtpData, { rejectWithValue }) => {
        try {
            const response = await authServices.resendCodeOtp(resendCodeOtpData);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la réexpédition du code OTP");
            }
            return rejectWithValue("Échec de la réexpédition du code OTP");
        }
    }
)

export const forgotPasswordThunk = createAsyncThunk<{ user: User }, forgotPasswordDto>(
    "auth/forgotPassword",
    async (data, { rejectWithValue }) => {
        try {
            const response = await authServices.forgotPassword(data);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la demande de réinitialisation du mot de passe");
            }
            return rejectWithValue("Échec de la demande de réinitialisation du mot de passe");
        }
    }
)

export const resetPasswordThunk = createAsyncThunk<{ user: User }, resetPasswordDto>(
    "auth/resetPassword",
    async (data, { rejectWithValue }) => {
        try {
            const response = await authServices.resetPassword(data);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la réinitialisation du mot de passe");
            }
            return rejectWithValue("Échec de la réinitialisation du mot de passe");
        }
    }
)

export const updatePasswordThunk = createAsyncThunk<{ user: User }, updatePassword>(
    "auth/updatePassword",
    async (data, { rejectWithValue }) => {
        try {
            const response = await authServices.updatePassword(data);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la mise à jour du mot de passe");
            }
            return rejectWithValue("Échec de la mise à jour du mot de passe");
        }
    }
)


export const verifyOtpPasswordResetThunk = createAsyncThunk<{ user: User }, verifyAccountDto>(
    "auth/verifyOtpPasswordReset",
    async (data, { rejectWithValue }) => {
        try {
            const response = await authServices.verifyOtpPasswordReset(data);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la vérification du code OTP pour la réinitialisation du mot de passe");
            }
            return rejectWithValue("Échec de la vérification du code OTP pour la réinitialisation du mot de passe");
        }
    }
)

export const verifyResetTokenThunk = createAsyncThunk<{ user: User }, string>(
    "auth/verifyResetToken",
    async (token, { rejectWithValue }) => {
        try {
            const response = await authServices.verifyResetToken(token);
            return { user: response.data };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de la vérification du token de réinitialisation");
            }

            const message = error instanceof Error ? error.message : String(error);
            return rejectWithValue(message || "Échec de la vérification du token de réinitialisation");
        }
    }
)

export const initializeAuthThunk = createAsyncThunk<{ user: User }, void>(
    "auth/initialize",
    async (_, { rejectWithValue }) => {
        try {
            const response = await authServices.getCurrentUser();
            return { user: response.data };
        } catch (error) {
            // Pas besoin de rejeter avec un message bruyant ici, 
            // car l'absence de session est un état normal au premier chargement
            return rejectWithValue("Aucune session active");
        }
    }
);

export const completeOnboardingThunk = createAsyncThunk<{ success: boolean }, OnboardingDto>(
    "auth/completeOnboarding",
    async (onboardingData, { rejectWithValue }) => {
        try {
            const response = await authServices.completeOnboarding(onboardingData);
            return { success: response.success };
        } catch (error) {
            if (error instanceof ApiError) {
                return rejectWithValue(error.message || "Erreur lors de l'onboarding");
            }
            return rejectWithValue("Échec de l'onboarding");
        }
    }
);
