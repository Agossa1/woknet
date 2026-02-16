import { RootState } from "../../../store/store";

export const selectExperiences = (state: RootState) => state.experiences.experiences;
export const selectExperiencesLoading = (state: RootState) => state.experiences.isLoading;
export const selectExperiencesError = (state: RootState) => state.experiences.error;
