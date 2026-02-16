
export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}

export enum DEGREE_LEVEL {
    HIGH_SCHOOL = 'HIGH_SCHOOL',
    ASSOCIATE = 'ASSOCIATE',
    BACHELOR = 'BACHELOR',
    MASTER = 'MASTER',
    DOCTORATE = 'DOCTORATE',
    CERTIFICATE = 'CERTIFICATE',
    DIPLOMA = 'DIPLOMA',
    PROFESSIONAL = 'PROFESSIONAL'
}

export interface EducationsDTO {
    id: string;
    profile_id: string;
    school_name: string;
    degree: DEGREE_LEVEL;
    field_of_study: string;
    start_date: Date;
    end_date: Date;
    is_current: boolean;
    description: string;
    location: string;
    stack: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}

export interface CreateEducationsDTO {
    profile_id: string;
    school_name: string;
    degree: DEGREE_LEVEL;
    field_of_study: string;
    start_date: Date;
    end_date: Date;
    is_current: boolean;
    description: string;
    location: string;
    stack: string;
}

export interface UpdateEducationDTO {
    school_name: string;
    degree: DEGREE_LEVEL;
    field_of_study: string;
    start_date: Date;
    end_date: Date;
    is_current: boolean;
    description: string;
    location: string;
    stack: string;
}

export interface EducationResponses extends Omit<EducationsDTO, 'profile_id'> {
    id: string;
}
