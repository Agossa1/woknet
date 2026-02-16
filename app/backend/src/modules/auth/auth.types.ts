export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPERADMIN = 'SUPERADMIN',
    MODERATEUR = 'MODERATEUR',
    ASSISTANT = 'ASSISTANT'

}

export interface User {
    id: string;
    full_name: string;
    email: string;
    password_hash: string;
    headline?: string;
    phone_number?: string;
    is_verified: boolean;
    is_active: boolean;
    otp_code?: string;
    otp_expires_at?: Date;
    otp_hashed?: string;
    verified_at?: Date;
    last_login_at?: Date;
    roles: Role[];
    has_onboarded: boolean;
    industry_id?: string;
    city?: string;
    country?: string;
    job_title?: string;
    job_type?: string;
    access_token?: string;
    refresh_token?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
    registration_ip?: string
    last_login_ip?: string
}

export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}

/**
 * ======================== DTO - INSCRIPTION ========================
 */
export interface CreateUserDTO {
    full_name: string;
    email: string;
    password: string;
    phone_number?: string;
    ip_address?: string;
    user_agent?: string;
}

/**
 * ======================== DTO - CONNEXION ========================
 */

export interface LoginDTO {
    email: string;
    password: string;
    phone_number?: string;
    ip_address?: string;
    user_agent?: string;
}


/** * ======================== DTO - OTP ========================
 */


export interface verifyOtpDTO {
    email: string;
    phone_number?: string;
    otp_code: string;
}

/**
 * ======================== DTO - REFRESH TOKEN ========================
 */

export interface AuthResponse extends Omit<User, 'password_hash' | 'otp_code' | 'otp_expires_at' | 'otp_hashed'> {
    access_token: string;
    refresh_token: string;
}
/**
 * ======================== DTO - ONBOARDING ========================
 */
export interface OnboardingDTO {
    userId: string;
    headline: string;
    city: string;
    country: string;
    industry_id?: string;
    company_name?: string;
    job_title?: string;
    job_type?: string; // e.g. 'FULL_TIME', 'FREELANCE'
    start_date?: Date;
}

