import { createAsyncThunk } from '@reduxjs/toolkit';
import { sharesApi, Share } from './shares-api';
import { trackSignalThunk } from '../../recommendations/services/recommendations-thunks';

export const sharePostThunk = createAsyncThunk<Share, { postId: string; caption?: string }>(
    'shares/sharePost',
    async ({ postId, caption }, { dispatch, rejectWithValue }) => {
        try {
            const share = await sharesApi.sharePost(postId, caption);

            // TRACKING: SHARE
            dispatch(trackSignalThunk({
                item_id: postId,
                item_type: 'POST',
                action_type: 'SHARE',
                weight: 15 // Very strong engagement signal
            }));

            return share;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to share post');
        }
    }
);

export const unsharePostThunk = createAsyncThunk<string, string>(
    'shares/unsharePost',
    async (shareId, { rejectWithValue }) => {
        try {
            await sharesApi.unsharePost(shareId);
            return shareId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to unshare post');
        }
    }
);
