export interface IDatabase {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}

// ------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------
export enum SKILL_LEVEL {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

// ------------------------------------------------------------------
// Entities (correspond to DB tables)
// ------------------------------------------------------------------
export interface Skill {
    id: string;
    name: string;
    category?: string;
}

export interface ProfileSkill {
    profile_id: string;
    skill_id: string;
    level: SKILL_LEVEL;
    endorsements_count: number;
    created_at: Date;
    // Joined fields (optional)
    skill_name?: string;
    skill_category?: string;
}

export interface SkillEndorsement {
    id: string;
    skill_id: string;
    profile_id: string;
    endorser_id: string;
    created_at: Date;
}

// ------------------------------------------------------------------
// DTOs (Data Transfer Objects)
// ------------------------------------------------------------------

// POST /api/skills
export interface CreateSkillDTO {
    name: string;
    category?: string;
}

// POST /api/profiles/me/skills
export interface AddProfileSkillDTO {
    skill_name: string; // User sends name, we find or create
    level?: SKILL_LEVEL;
}

// PUT /api/profiles/me/skills/:skillId
export interface UpdateProfileSkillDTO {
    level: SKILL_LEVEL;
}

// POST /api/profiles/:profileId/skills/:skillId/endorse
export interface EndorseSkillDTO {
    endorser_id: string; // From auth token
}
