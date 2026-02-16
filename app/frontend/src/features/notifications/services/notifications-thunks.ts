import { createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsApi } from "./notifications-api";

export const fetchNotificationsThunk = createAsyncThunk(
    "notifications/fetchAll",
    async ({ limit, offset }: { limit?: number; offset?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await notificationsApi.getNotifications(limit, offset);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch notifications");
        }
    }
);

export const fetchUnreadCountThunk = createAsyncThunk(
    "notifications/fetchUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationsApi.getUnreadCount();
            return response.count;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch unread count");
        }
    }
);

export const markAsReadThunk = createAsyncThunk(
    "notifications/markRead",
    async (id: string, { rejectWithValue }) => {
        try {
            await notificationsApi.markAsRead(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to mark as read");
        }
    }
);

export const markAllReadThunk = createAsyncThunk(
    "notifications/markAllRead",
    async (_, { rejectWithValue }) => {
        try {
            await notificationsApi.markAllRead();
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to mark all as read");
        }
    }
);

export const deleteNotificationThunk = createAsyncThunk(
    "notifications/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await notificationsApi.deleteNotification(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to delete notification");
        }
    }
);
