export type LanguageProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE';

export interface LanguageDTO {
    id: string;
    profile_id: string;
    name: string;
    proficiency: LanguageProficiency;
    created_at: Date;
    updated_at: Date;
}

export interface CreateLanguageDTO {
    profile_id: string;
    name: string;
    proficiency: LanguageProficiency;
}

export interface UpdateLanguageDTO {
    name?: string;
    proficiency?: LanguageProficiency;
}

export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}
