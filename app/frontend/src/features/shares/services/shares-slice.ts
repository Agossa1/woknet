import { createSlice } from '@reduxjs/toolkit';
import { sharePostThunk, unsharePostThunk } from './shares-thunks';

interface SharesState {
    loading: boolean;
    error: string | null;
}

const initialState: SharesState = {
    loading: false,
    error: null,
};

const sharesSlice = createSlice({
    name: 'shares',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(sharePostThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sharePostThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(sharePostThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(unsharePostThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(unsharePostThunk.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(unsharePostThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default sharesSlice.reducer;
