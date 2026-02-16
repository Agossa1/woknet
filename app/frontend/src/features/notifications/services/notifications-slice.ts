import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotificationsState, Notification } from "./notifications-types";
import {
    fetchNotificationsThunk,
    fetchUnreadCountThunk,
    markAsReadThunk,
    markAllReadThunk,
    deleteNotificationThunk
} from "./notifications-thunks";

const initialState: NotificationsState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchNotificationsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
            })
            .addCase(fetchNotificationsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Unread Count
            .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            // Mark Read
            .addCase(markAsReadThunk.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification && !notification.is_read) {
                    notification.is_read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark All Read
            .addCase(markAllReadThunk.fulfilled, (state) => {
                state.notifications.forEach(n => n.is_read = true);
                state.unreadCount = 0;
            })
            // Delete
            .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n.id === action.payload);
                if (index !== -1) {
                    if (!state.notifications[index].is_read) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.notifications.splice(index, 1);
                }
            });
    },
});

export const { addNotification, incrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
