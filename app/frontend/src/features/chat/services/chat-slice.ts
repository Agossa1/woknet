import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatState, ChatMessage, Conversation } from "./chat-types";
import {
    fetchConversationsThunk,
    fetchMessagesThunk,
    sendMessageThunk,
    startConversationThunk
} from "./chat-thunks";

const initialState: ChatState = {
    conversations: [],
    activeConversationId: null,
    messages: {},
    loading: false,
    error: null,

    onlineUsers: [],
    typingUsers: {}
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },

        receiveMessage: (state, action: PayloadAction<{ conversationId: string; message: ChatMessage }>) => {
            const { conversationId, message } = action.payload;

            // Add to messages if we have them in cache
            if (state.messages[conversationId]) {
                // Prevent duplicates if we sent it and then received it back (though socket logic usually handles this)
                if (!state.messages[conversationId].some(m => m.id === message.id)) {
                    state.messages[conversationId] = [message, ...state.messages[conversationId]];
                }
            } else {
                state.messages[conversationId] = [message];
            }

            // Update conversation last message and move to top
            const convIndex = state.conversations.findIndex(c => c.id === conversationId);
            if (convIndex !== -1) {
                const conv = state.conversations[convIndex];
                conv.last_message = message;
                conv.updated_at = message.created_at;

                // Move to top
                state.conversations.splice(convIndex, 1);
                state.conversations.unshift(conv);
            }
        },
        markMessagesAsRead: (state, action: PayloadAction<{ conversationId: string; readerId: string }>) => {
            const { conversationId } = action.payload;

            // Mark cached messages as read
            if (state.messages[conversationId]) {
                state.messages[conversationId] = state.messages[conversationId].map(m => ({
                    ...m,
                    is_read: true
                }));
            }

            // Update last message status in conversation list
            const conv = state.conversations.find(c => c.id === conversationId);
            if (conv && conv.last_message) {
                conv.last_message.is_read = true;
            }
        },
        setOnlineUsers: (state, action: PayloadAction<string[]>) => {
            state.onlineUsers = action.payload;
        },
        updateUserStatus: (state, action: PayloadAction<{ userId: string; isOnline: boolean }>) => {
            const { userId, isOnline } = action.payload;
            if (isOnline) {
                if (!state.onlineUsers.includes(userId)) {
                    state.onlineUsers.push(userId);
                }
            } else {
                state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
            }
        },
        userStartedTyping: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
            const { conversationId, userId } = action.payload;
            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }
            if (!state.typingUsers[conversationId].includes(userId)) {
                state.typingUsers[conversationId].push(userId);
            }
        },
        userStoppedTyping: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
            const { conversationId, userId } = action.payload;
            if (state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Conversations
            .addCase(fetchConversationsThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
            })
            .addCase(fetchConversationsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Messages
            .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
                const { conversationId, messages } = action.payload;
                state.messages[conversationId] = messages;
            })

            // Send Message
            .addCase(sendMessageThunk.fulfilled, (state, action) => {
                const message = action.payload;
                const conversationId = message.conversation_id;

                if (state.messages[conversationId]) {
                    if (!state.messages[conversationId].some(m => m.id === message.id)) {
                        state.messages[conversationId] = [message, ...state.messages[conversationId]];
                    }
                } else {
                    state.messages[conversationId] = [message];
                }

                const convIndex = state.conversations.findIndex(c => c.id === conversationId);
                if (convIndex !== -1) {
                    state.conversations[convIndex].last_message = message;
                    state.conversations[convIndex].updated_at = message.created_at;

                    const conv = state.conversations[convIndex];
                    state.conversations.splice(convIndex, 1);
                    state.conversations.unshift(conv);
                }
            })

            // Start Conversation
            .addCase(startConversationThunk.fulfilled, (state, action) => {
                const newConv = action.payload;
                if (!state.conversations.some(c => c.id === newConv.id)) {
                    state.conversations.unshift(newConv);
                }
                state.activeConversationId = newConv.id;

            });
    }
});

export const { setActiveConversation, receiveMessage, markMessagesAsRead, setOnlineUsers, updateUserStatus, userStartedTyping, userStoppedTyping } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
