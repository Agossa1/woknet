export enum Role {
    SUPERADMIN = 'SUPERADMIN',
    ADMIN = 'ADMIN',
    MODERATEUR = 'MODERATEUR',
    USER = 'USER',
}


export interface User {
    id: string,
    full_name: string,
    email?: string,
    phone_number?: string,
    password_hash: string,

    is_verified: boolean,
    is_active: boolean,

    verified_at?: Date,
    last_login?: Date,
    otp_code?: string,
    otp_expires_at?: Date,

    roles: Role[],
    has_onboarded: boolean,
    headline?: string,
    industry_id?: string,
    city?: string,
    country?: string,
    job_title?: string,
    job_type?: string,
    created_at: Date,
    updated_at: Date,
    followers_count?: number,
    following_count?: number,
    two_factor_enabled?: boolean,
    requires2FA?: boolean,
}


export interface createUserDto {
    full_name: string,
    email?: string,
    phone_number?: string,
    password: string,

}

export interface loginUserDto {
    email?: string,
    phone_number?: string,
    password: string
}


export interface verifyAccountDto {
    email?: string,
    phone_number?: string,
    otp_code: string
}


export interface resendCodeOtpDto {
    email?: string,
    phone_number?: string,
}

export interface resetPasswordDto {
    email?: string,
    phone_number?: string,
}

export interface updatePassword {
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
}

export interface forgotPasswordDto {
    email?: string,
    phone_number?: string,
}

export interface OnboardingDto {
    headline: string;
    city: string;
    country: string;
    industry_id?: string;
    company_name?: string;
    job_title?: string;
    job_type?: string;
    start_date?: string;
}

export interface Industry {
    id: string;
    label: string;
    icon: string;
    category: string;
}

export interface Country {
    code: string;
    name_fr: string;
    name_en: string;
    flag_emoji: string;
    phone_code: string;
}

export interface JobTitle {
    id: number;
    title: string;
    category: string;
}

export interface JobType {
    id: string;
    label: string;
}

export interface AuthResponse extends Omit<User, 'password_hash'> {
    accessToken: string,
    refreshToken: string
}