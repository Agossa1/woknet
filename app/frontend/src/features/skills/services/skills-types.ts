
// Enums matching Backend
export enum SkillLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

// Entities
export interface Skill {
    id: string;
    name: string;
    category?: string;
}

export interface ProfileSkill {
    profile_id: string;
    skill_id: string;
    level: SkillLevel;
    endorsements_count: number;
    created_at: string; // ISO Date
    skill_name?: string;     // Joined from backend
    skill_category?: string; // Joined from backend
}

// API Responses
export interface SkillSearchResponse extends Array<Skill> { }
export interface ProfileSkillResponse extends ProfileSkill { }

// DTOs for mutations
export interface AddSkillDTO {
    skill_name: string;
    level?: SkillLevel;
}

export interface UpdateSkillDTO {
    level: SkillLevel;
}