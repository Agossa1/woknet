import { createAsyncThunk } from "@reduxjs/toolkit";
import { AddSkillDTO, ProfileSkill, Skill, SkillLevel } from "./skills-types";
import { skillsApi } from "./skills-api";
import { RootState } from "../../../store/store";

// Search Skills Thunk
export const getProfileSkillsThunk = createAsyncThunk<ProfileSkill[], string>(
    "skills/getProfileSkills",
    async (profileId, { rejectWithValue }) => {
        try {
            return await skillsApi.getProfileSkills(profileId);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch profile skills");
        }
    }
);

export const searchSkillsThunk = createAsyncThunk<Skill[], string>(
    "skills/search",
    async (query, { rejectWithValue, signal }) => {
        try {
            if (!query) return [];
            return await skillsApi.searchSkills(query);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to search skills");
        }
    }
);

// Add Skill Thunk
// Requires profileId implicitly from state or explicitly
interface AddSkillPayload {
    profileId: string;
    skillName: string;
    level?: SkillLevel;
}

export const addSkillThunk = createAsyncThunk<ProfileSkill, AddSkillPayload>(
    "skills/add",
    async ({ profileId, skillName, level }, { rejectWithValue }) => {
        try {
            const dto: AddSkillDTO = { skill_name: skillName, level };
            return await skillsApi.addSkillToProfile(profileId, dto);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to add skill");
        }
    }
);

// Remove Skill Thunk
interface RemoveSkillPayload {
    profileId: string;
    skillId: string;
}

export const removeSkillThunk = createAsyncThunk<string, RemoveSkillPayload>(
    "skills/remove",
    async ({ profileId, skillId }, { rejectWithValue }) => {
        try {
            await skillsApi.removeSkillFromProfile(profileId, skillId);
            return skillId; // Return ID to remove from state
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to remove skill");
        }
    }
);

// Endorse Skill Thunk
interface EndorseSkillPayload {
    profileId: string;
    skillId: string;
}

export const endorseSkillThunk = createAsyncThunk<string, EndorseSkillPayload>(
    "skills/endorse",
    async ({ profileId, skillId }, { rejectWithValue }) => {
        try {
            await skillsApi.endorseSkill(profileId, skillId);
            return skillId; // Return ID to increment endorsement count
        } catch (error: any) {
            if (error.response?.status === 409) {
                return rejectWithValue("Already endorsed");
            }
            return rejectWithValue(error.message || "Failed to endorse skill");
        }
    }
);

export const removeEndorsementThunk = createAsyncThunk<string, EndorseSkillPayload>(
    "skills/unendorse",
    async ({ profileId, skillId }, { rejectWithValue }) => {
        try {
            await skillsApi.removeEndorsement(profileId, skillId);
            return skillId; // Return ID to decrement
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to remove endorsement");
        }
    }
);
