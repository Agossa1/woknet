import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CompaniesState } from "./companies-types";
import {
    getMyCompaniesThunk,
    createCompanyThunk,
    updateCompanyThunk,
    deleteCompanyThunk
} from "./companies-thunks";

const initialState: CompaniesState = {
    myCompanies: [],
    currentCompany: null,
    isLoading: false,
    error: null,
};

const companiesSlice = createSlice({
    name: "companies",
    initialState,
    reducers: {
        setCurrentCompany: (state, action: PayloadAction<string | null>) => {
            state.currentCompany = state.myCompanies.find(c => c.id === action.payload) || null;
        },
        clearCompanyError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Get My Companies
        builder.addCase(getMyCompaniesThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getMyCompaniesThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.myCompanies = action.payload;
        });
        builder.addCase(getMyCompaniesThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Create Company
        builder.addCase(createCompanyThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(createCompanyThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.myCompanies.unshift(action.payload);
        });
        builder.addCase(createCompanyThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Update Company
        builder.addCase(updateCompanyThunk.fulfilled, (state, action) => {
            const index = state.myCompanies.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.myCompanies[index] = action.payload;
            }
            if (state.currentCompany?.id === action.payload.id) {
                state.currentCompany = action.payload;
            }
        });

        // Delete Company
        builder.addCase(deleteCompanyThunk.fulfilled, (state, action) => {
            state.myCompanies = state.myCompanies.filter(c => c.id !== action.payload);
            if (state.currentCompany?.id === action.payload) {
                state.currentCompany = null;
            }
        });
    }
});

export const { setCurrentCompany, clearCompanyError } = companiesSlice.actions;
export default companiesSlice.reducer;
