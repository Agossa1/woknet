import { RootState } from "@/src/store/store";

export const selectEducations = (state: RootState) => state.educations.educations;
export const selectEducationsLoading = (state: RootState) => state.educations.isLoading;
export const selectEducationsError = (state: RootState) => state.educations.error;
