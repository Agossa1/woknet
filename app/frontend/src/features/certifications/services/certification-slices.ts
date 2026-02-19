import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Certification } from "./certification-types";
import { addCertificationThunk, deleteCertificationThunk, getProfileCertificationsThunk, updateCertificationThunk } from "./certification-thunks";
import { RootState } from "@/src/store/store";

interface CertificationsState {
    certifications: Certification[];
    loading: boolean;
}

const initialState: CertificationsState = {
    certifications: [],
    loading: false,
};

const certificationsSlice = createSlice({
    name: "certifications",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProfileCertificationsThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getProfileCertificationsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.certifications = action.payload;
            })
            .addCase(getProfileCertificationsThunk.rejected, (state) => {
                state.loading = false;
            })
            .addCase(addCertificationThunk.fulfilled, (state, action) => {
                state.certifications.unshift(action.payload);
            })
            .addCase(updateCertificationThunk.fulfilled, (state, action) => {
                const index = state.certifications.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.certifications[index] = action.payload;
                }
            })
            .addCase(deleteCertificationThunk.fulfilled, (state, action) => {
                state.certifications = state.certifications.filter(c => c.id !== action.payload);
            });
    },
});

export const selectCertifications = (state: RootState) => state.certifications.certifications;
export const selectCertificationsLoading = (state: RootState) => state.certifications.loading;

export default certificationsSlice.reducer;
