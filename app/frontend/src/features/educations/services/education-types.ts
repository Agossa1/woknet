export enum DegreeLevel {
    HIGH_SCHOOL = 'HIGH_SCHOOL',
    ASSOCIATE = 'ASSOCIATE',
    BACHELOR = 'BACHELOR',
    MASTER = 'MASTER',
    DOCTORATE = 'DOCTORATE',
    CERTIFICATE = 'CERTIFICATE',
    DIPLOMA = 'DIPLOMA',
    PROFESSIONAL = 'PROFESSIONAL'
}

export const DEGREE_LABELS: Record<DegreeLevel, string> = {
    [DegreeLevel.HIGH_SCHOOL]: 'Baccalauréat',
    [DegreeLevel.ASSOCIATE]: 'DUT/BTS',
    [DegreeLevel.BACHELOR]: 'Licence',
    [DegreeLevel.MASTER]: 'Master',
    [DegreeLevel.DOCTORATE]: 'Doctorat',
    [DegreeLevel.CERTIFICATE]: 'Certificat',
    [DegreeLevel.DIPLOMA]: 'Diplôme',
    [DegreeLevel.PROFESSIONAL]: 'Formation professionnelle'
};

export interface Education {
    id: string;
    profile_id: string;
    school_name: string;
    degree: DegreeLevel;
    field_of_study: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
    location?: string;
    stack?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateEducationDTO {
    profile_id: string;
    school_name: string;
    degree: DegreeLevel;
    field_of_study: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description?: string;
    location?: string;
    stack?: string;
}

export interface UpdateEducationDTO extends Partial<CreateEducationDTO> { }

export interface EducationState {
    educations: Education[];
    isLoading: boolean;
    error: string | null;
}
