import { ApiClient, api } from "../../api/apiClients";
import { createUserDto, forgotPasswordDto, Industry, Country, JobTitle, JobType, loginUserDto, OnboardingDto, resendCodeOtpDto, resetPasswordDto, updatePassword, User, verifyAccountDto } from "./authTypes";

export class AuthServices {
    private readonly BASE_PATH = "/auth"

    constructor(private apiClient: ApiClient) { }

    public async register(dto: createUserDto) {
        return this.apiClient.post<{ success: boolean; message: string; data: User }>(
            `${this.BASE_PATH}/register`,
            dto
        );
    }

    // LOGIN 

    public async login(dto: loginUserDto) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(
            `${this.BASE_PATH}/login`,
            dto
        )
    }

    // VERIFY ACCOUNT

    public async verifyAccount(dto: verifyAccountDto) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(
            `${this.BASE_PATH}/verify-account`,
            dto
        )
    }

    // RESEND CODE OTP

    public async resendCodeOtp(dto: resendCodeOtpDto) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(
            `${this.BASE_PATH}/resend-code-otp`,
            dto
        )
    }

    // ForgetPassword 
    public async forgotPassword(dto: forgotPasswordDto) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(
            `${this.BASE_PATH}/forgot-password`,
            dto
        )
    }

    // ResetPassword 
    public async resetPassword(dto: resetPasswordDto) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(
            `${this.BASE_PATH}/reset-password`,
            dto
        )
    }

    // Logout 

    public async logout() {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(
            `${this.BASE_PATH}/logout`,
            {}
        )
    }

    // UPDATE PASSWORD 
    public async updatePassword(dto: updatePassword) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(`${this.BASE_PATH}/update-password`, dto)
    }

    // VERIFY OTP PASSWORD RESET
    public async verifyOtpPasswordReset(dto: { email?: string, phone_number?: string, otp_code: string }) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(`${this.BASE_PATH}/verify-otp-password-reset`, dto)
    }

    // VERIFY RESET TOKEN
    public async verifyResetToken(token: string) {
        return this.apiClient.post<{ success: boolean, message: string; data: User }>(`${this.BASE_PATH}/verify-reset-token`, { token })
    }

    // GET CURRENT USER (Session Persistence)
    public async getCurrentUser() {
        return this.apiClient.get<{ success: boolean; data: User }>(
            `${this.BASE_PATH}/me`
        );
    }

    public async completeOnboarding(dto: OnboardingDto) {
        return this.apiClient.post<{ success: boolean; message: string }>(
            `${this.BASE_PATH}/complete-onboarding`,
            dto
        );
    }

    public async getIndustries() {
        return this.apiClient.get<{ success: boolean; data: Industry[] }>(
            `${this.BASE_PATH}/industries`
        );
    }

    public async getCountries() {
        return this.apiClient.get<{ success: boolean; data: Country[] }>(
            `${this.BASE_PATH}/countries`
        );
    }

    public async getJobCatalog() {
        return this.apiClient.get<{ success: boolean; data: JobTitle[] }>(
            `${this.BASE_PATH}/job-catalog`
        );
    }

    public async getJobTypes() {
        return this.apiClient.get<{ success: boolean; data: JobType[] }>(
            `${this.BASE_PATH}/job-types`
        );
    }

    // 2FA Methods
    public async setup2FA() {
        return this.apiClient.get<{ success: boolean; data: { secret: string; qrCodeUrl: string } }>(
            `${this.BASE_PATH}/2fa/setup`
        );
    }

    public async enable2FA(dto: { secret: string; token: string }) {
        return this.apiClient.post<{ success: boolean; message: string; data: { recoveryCodes: string[] } }>(
            `${this.BASE_PATH}/2fa/enable`,
            dto
        );
    }

    public async disable2FA(dto: { password?: string }) {
        return this.apiClient.post<{ success: boolean; message: string }>(
            `${this.BASE_PATH}/2fa/disable`,
            dto
        );
    }

    public async verify2FA(dto: { userId: string; token: string }) {
        return this.apiClient.post<{ success: boolean; message: string; data: User }>(
            `${this.BASE_PATH}/2fa/verify`,
            dto
        );
    }
}

// Export instance for use in thunks
export const authServices = new AuthServices(api);