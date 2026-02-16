import { RootState } from "../../../store/store";

export const selectProfileSkills = (state: RootState) => state.skills.profileSkills;
export const selectSkillSearchResults = (state: RootState) => state.skills.searchResults;
export const selectSkillsLoading = (state: RootState) => state.skills.loading;
export const selectSkillsError = (state: RootState) => state.skills.error;
