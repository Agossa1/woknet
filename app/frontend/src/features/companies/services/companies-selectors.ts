import { RootState } from "../../../store/store";

export const selectMyCompanies = (state: RootState) => state.companies.myCompanies;
export const selectCurrentCompany = (state: RootState) => state.companies.currentCompany;
export const selectCompaniesLoading = (state: RootState) => state.companies.isLoading;
export const selectCompaniesError = (state: RootState) => state.companies.error;
