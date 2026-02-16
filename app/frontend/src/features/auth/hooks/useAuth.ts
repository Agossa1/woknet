import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { selectAuthLoading, selectAuthUser, selectError, selectIsAuthenticated, selectSuccessMessage } from "../services/authSelectors"
import { createUserDto, forgotPasswordDto, loginUserDto, resendCodeOtpDto, resetPasswordDto, updatePassword, verifyAccountDto } from "../services/authTypes";
import { forgotPasswordThunk, loginThunk, logoutThunk, registerThunk, resendCodeOtpThunk, resetPasswordThunk, updatePasswordThunk, verifyAccountThunk, verifyOtpPasswordResetThunk, verifyResetTokenThunk } from "../services/authThunks";
import { clearAuthMessages as clearAuthMessagesAction } from "../services/authSlice";


export const useAuth = () => {
    const dispatch = useAppDispatch();

    // 1. Données (Lecteur du state)

    const user = useAppSelector(selectAuthUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const isLoading = useAppSelector(selectAuthLoading)
    const error = useAppSelector(selectError)
    const successMessage = useAppSelector(selectSuccessMessage)


    // 2. Methodes
    const handleRegister = async (data: createUserDto) => {
        return await dispatch(registerThunk(data)).unwrap();
    }
    const handleLogin = async (data: loginUserDto) => {
        return await dispatch(loginThunk(data)).unwrap();
    }

    const handleLogout = async () => {
        return await dispatch(logoutThunk()).unwrap();
    }

    const handleVerifyAccount = async (data: verifyAccountDto) => {
        return await dispatch(verifyAccountThunk(data)).unwrap();
    }

    const handleResendCodeOtp = async (data: resendCodeOtpDto) => {
        return await dispatch(resendCodeOtpThunk(data)).unwrap();
    }

    const handleForgotPassword = async (data: forgotPasswordDto) => {
        return await dispatch(forgotPasswordThunk(data)).unwrap();
    }

    const handleResetPassword = async (data: resetPasswordDto) => {
        return await dispatch(resetPasswordThunk(data)).unwrap();
    }

    const handleUpdatePassword = async (data: updatePassword) => {
        return await dispatch(updatePasswordThunk(data)).unwrap();
    }

    const handleVerifyOtpPasswordReset = async (data: verifyAccountDto) => {
        return await dispatch(verifyOtpPasswordResetThunk(data)).unwrap();
    }

    const handleVerifyResetToken = async (data: string) => {
        return await dispatch(verifyResetTokenThunk(data)).unwrap();
    }


    const handleClearAuthMessages = () => {
        dispatch(clearAuthMessagesAction());
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        successMessage,

        // Actions 
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        verifyAccount: handleVerifyAccount,
        resendCodeOtp: handleResendCodeOtp,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword,
        updatePassword: handleUpdatePassword,
        verifyOtpPasswordReset: handleVerifyOtpPasswordReset,
        verifyResetToken: handleVerifyResetToken,
        clearAuthMessages: handleClearAuthMessages,

    }
}