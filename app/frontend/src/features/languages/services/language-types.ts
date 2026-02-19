export type LanguageProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE';

export interface Language {
    id: string;
    profile_id: string;
    name: string;
    proficiency: LanguageProficiency;
    created_at: string;
    updated_at: string;
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
