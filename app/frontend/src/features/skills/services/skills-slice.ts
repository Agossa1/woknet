import { createSlice } from "@reduxjs/toolkit";
import { ProfileSkill, Skill } from "./skills-types";
import { addSkillThunk, endorseSkillThunk, removeSkillThunk, searchSkillsThunk, removeEndorsementThunk, getProfileSkillsThunk } from "./skills-thunks"; // Adjust import

interface SkillsState {
    profileSkills: ProfileSkill[]; // For current profile or logged-in user
    searchResults: Skill[];
    loading: boolean;
    error: string | null;
}

const initialState: SkillsState = {
    profileSkills: [], // You'll likely map from user profile state if nested
    searchResults: [],
    loading: false,
    error: null,
};

const skillsSlice = createSlice({
    name: "skills",
    initialState,
    reducers: {
        setProfileSkills: (state, action) => {
            state.profileSkills = action.payload; // Called when profile fetches
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        }
    },
    extraReducers: (builder) => {
        // Get Profile Skills
        builder.addCase(getProfileSkillsThunk.pending, (state) => {
            // We can use a separate loading state if needed, but global loading is fine for now
            state.loading = true;
        });
        builder.addCase(getProfileSkillsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.profileSkills = action.payload;
        });
        builder.addCase(getProfileSkillsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Search
        builder.addCase(searchSkillsThunk.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(searchSkillsThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.searchResults = action.payload;
        });
        builder.addCase(searchSkillsThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Add Skill
        builder.addCase(addSkillThunk.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addSkillThunk.fulfilled, (state, action) => {
            state.loading = false;
            // Assuming ProfileSkill is returned with full structure
            state.profileSkills.push(action.payload);
        });
        builder.addCase(addSkillThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Remove Skill
        builder.addCase(removeSkillThunk.fulfilled, (state, action) => {
            // Assume removal from component optimistically or backend returns ID
            // If Thunk returns ID of removed skill:
            state.profileSkills = state.profileSkills.filter(skill => skill.skill_id !== action.payload);
        });

        // Endorse Skill
        builder.addCase(endorseSkillThunk.fulfilled, (state, action) => {
            const skill = state.profileSkills.find(s => s.skill_id === action.payload);
            if (skill) {
                skill.endorsements_count += 1;
            }
        });

        // Remove Endorsement
        builder.addCase(removeEndorsementThunk.fulfilled, (state, action) => {
            const skill = state.profileSkills.find(s => s.skill_id === action.payload);
            if (skill) {
                skill.endorsements_count = Math.max(0, skill.endorsements_count - 1);
            }
        });
    }
});

export const { setProfileSkills, clearSearchResults } = skillsSlice.actions;
export default skillsSlice.reducer;
