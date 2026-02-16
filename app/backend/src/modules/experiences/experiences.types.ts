
export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}

export enum TYPEJOB {
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

export enum TYPEPLACE {
    ONSITE = 'ONSITE',
    HYBRID = 'HYBRID',
    REMOTE = 'REMOTE',
    MOBILE = 'MOBILE',
    TRAVEL_BASED = 'TRAVEL_BASED',
    OFFSHORE = 'OFFSHORE',
    COWORKING = 'COWORKING',
    FLEXIBLE = 'FLEXIBLE'
}
export interface ExperiencesDTO {
    id: string;
    profile_id: string;
    title: string;
    company_name: string;
    type_job: TYPEJOB;
    type_place: TYPEPLACE;
    start_date: Date;
    end_date: Date;
    description: string;
    location: string;
    salary: string;
    currency: string;
    is_current: boolean;
    country: string;
    city: string;
    stack: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}


export interface CreateExperiencesDTO {
    title: string;
    profile_id: string;
    company_name: string;
    type_job: TYPEJOB;
    type_place: TYPEPLACE;
    start_date: Date;
    end_date: Date;
    description: string;
    country: string;
    city: string;
    stack: string;
    location: string;
    salary: string;
    currency: string;
    is_current: boolean;

}

export interface UpdateExperienceDTO {
    title: string;
    profile_id: string;
    company_name: string;
    type_job: TYPEJOB;
    type_place: TYPEPLACE;
    start_date: Date;
    end_date: Date;
    description: string;
    country: string;
    city: string;
    stack: string;
    location: string;
    salary: string;
    currency: string;
    is_current: boolean;

}


export interface ExperienceResponses extends Omit<ExperiencesDTO, 'profile_id'> {
    id: string;
}


