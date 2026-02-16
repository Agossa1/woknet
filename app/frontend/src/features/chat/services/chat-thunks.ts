import { createAsyncThunk } from "@reduxjs/toolkit";
import { chatApi } from "./chat-api";

export const fetchConversationsThunk = createAsyncThunk(
    "chat/fetchConversations",
    async (_, { rejectWithValue }) => {
        try {
            return await chatApi.getConversations();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch conversations");
        }
    }
);

export const fetchMessagesThunk = createAsyncThunk(
    "chat/fetchMessages",
    async ({ conversationId, limit, offset }: { conversationId: string; limit?: number; offset?: number }, { rejectWithValue }) => {
        try {
            const messages = await chatApi.getMessages(conversationId, limit, offset);
            return { conversationId, messages };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to fetch messages");
        }
    }
);

export const sendMessageThunk = createAsyncThunk(
    "chat/sendMessage",
    async ({ conversationId, content, type, metadata }: { conversationId: string; content: string; type?: string; metadata?: any }, { rejectWithValue }) => {
        try {
            return await chatApi.sendMessage(conversationId, content, type, metadata);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to send message");
        }
    }
);

export const startConversationThunk = createAsyncThunk(
    "chat/startConversation",
    async (targetProfileId: string, { rejectWithValue }) => {
        try {
            return await chatApi.startConversation(targetProfileId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to start conversation");
        }
    }
);

export const markReadThunk = createAsyncThunk(
    "chat/markRead",
    async (conversationId: string, { rejectWithValue }) => {
        try {
            return await chatApi.markAsRead(conversationId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Failed to mark as read");
        }
    }
);
