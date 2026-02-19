import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Language } from "./language-types";
import { addLanguageThunk, deleteLanguageThunk, getProfileLanguagesThunk, updateLanguageThunk } from "./language-thunks";
import { RootState } from "@/src/store/store";

interface LanguagesState {
    languages: Language[];
    loading: boolean;
    error: string | null;
}

const initialState: LanguagesState = {
    languages: [],
    loading: false,
    error: null,
};

const languagesSlice = createSlice({
    name: "languages",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProfileLanguagesThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getProfileLanguagesThunk.fulfilled, (state, action: PayloadAction<Language[]>) => {
                state.loading = false;
                state.languages = action.payload;
            })
            .addCase(getProfileLanguagesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch languages";
            })
            .addCase(addLanguageThunk.fulfilled, (state, action: PayloadAction<Language>) => {
                state.languages.push(action.payload);
            })
            .addCase(updateLanguageThunk.fulfilled, (state, action: PayloadAction<Language>) => {
                const index = state.languages.findIndex(l => l.id === action.payload.id);
                if (index !== -1) {
                    state.languages[index] = action.payload;
                }
            })
            .addCase(deleteLanguageThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.languages = state.languages.filter(l => l.id !== action.payload);
            });
    },
});

export const selectLanguages = (state: RootState) => state.languages.languages;
export const selectLanguagesLoading = (state: RootState) => state.languages.loading;

export default languagesSlice.reducer;
