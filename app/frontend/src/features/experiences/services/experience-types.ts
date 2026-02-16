export enum ExperienceTypeJob {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    PERMANENT = 'PERMANENT',
    FIXED_TERM = 'FIXED_TERM',
    TEMPORARY = 'TEMPORARY',
    FREELANCE = 'FREELANCE',
    SELF_EMPLOYED = 'SELF_EMPLOYED',
    INTERNSHIP = 'INTERNSHIP',
    APPRENTICESHIP = 'APPRENTICESHIP',
    REMOTE = 'REMOTE',
    VOLUNTEER = 'VOLUNTEER'
}

export enum ExperienceTypePlace {
    ONSITE = 'ONSITE',
    HYBRID = 'HYBRID',
    REMOTE = 'REMOTE',
    MOBILE = 'MOBILE',
    TRAVEL_BASED = 'TRAVEL_BASED',
    OFFSHORE = 'OFFSHORE',
    COWORKING = 'COWORKING',
    FLEXIBLE = 'FLEXIBLE'
}

export const JOB_TYPE_LABELS: Record<ExperienceTypeJob, string> = {
    [ExperienceTypeJob.FULL_TIME]: 'Temps plein',
    [ExperienceTypeJob.PART_TIME]: 'Temps partiel',
    [ExperienceTypeJob.PERMANENT]: 'CDI',
    [ExperienceTypeJob.FIXED_TERM]: 'CDD',
    [ExperienceTypeJob.TEMPORARY]: 'Intérim',
    [ExperienceTypeJob.FREELANCE]: 'Freelance',
    [ExperienceTypeJob.SELF_EMPLOYED]: 'Indépendant',
    [ExperienceTypeJob.INTERNSHIP]: 'Stage',
    [ExperienceTypeJob.APPRENTICESHIP]: 'Alternance',
    [ExperienceTypeJob.REMOTE]: 'Télétravail',
    [ExperienceTypeJob.VOLUNTEER]: 'Bénévolat'
};

export const PLACE_TYPE_LABELS: Record<ExperienceTypePlace, string> = {
    [ExperienceTypePlace.ONSITE]: 'Sur site',
    [ExperienceTypePlace.HYBRID]: 'Hybride',
    [ExperienceTypePlace.REMOTE]: 'Télétravail',
    [ExperienceTypePlace.MOBILE]: 'Mobile',
    [ExperienceTypePlace.TRAVEL_BASED]: 'Déplacements',
    [ExperienceTypePlace.OFFSHORE]: 'Offshore',
    [ExperienceTypePlace.COWORKING]: 'Coworking',
    [ExperienceTypePlace.FLEXIBLE]: 'Flexible'
};

export interface Experience {
    id: string;
    profile_id: string;
    title: string;
    company_name: string;
    type_job: ExperienceTypeJob;
    type_place: ExperienceTypePlace;
    start_date: string;
    end_date?: string;
    description?: string;
    location?: string;
    salary?: string;
    currency?: string;
    is_current: boolean;
    country?: string;
    city?: string;
    stack?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateExperienceDTO {
    title: string;
    company_name: string;
    type_job: ExperienceTypeJob;
    type_place: ExperienceTypePlace;
    start_date: string;
    end_date?: string;
    description?: string;
    location?: string;
    country?: string;
    city?: string;
    salary?: string;
    currency?: string;
    is_current: boolean;
    stack?: string;
}

export interface UpdateExperienceDTO extends Partial<CreateExperienceDTO> { }

export interface ExperienceState {
    experiences: Experience[];
    isLoading: boolean;
    error: string | null;
}
