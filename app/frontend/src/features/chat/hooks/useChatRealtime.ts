import { useEffect } from 'react';
import { useSocket } from '@/src/infra/realtime/socket-provider';
import { useAppDispatch } from '@/src/store/hooks';
import { receiveMessage, markMessagesAsRead, setOnlineUsers, updateUserStatus, userStartedTyping, userStoppedTyping } from '../services/chat-slice';
import { ChatMessage } from '../services/chat-types';

export const useChatRealtime = () => {
    const { socket } = useSocket();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: { conversation_id: string; message: ChatMessage }) => {
            dispatch(receiveMessage({
                conversationId: data.conversation_id,
                message: data.message
            }));
        };

        const handleMessagesRead = (data: { conversation_id: string; reader_id: string }) => {
            dispatch(markMessagesAsRead({
                conversationId: data.conversation_id,
                readerId: data.reader_id
            }));
        };

        const handleOnlineUsers = (users: string[]) => {
            dispatch(setOnlineUsers(users));
        };

        const handleUserStatusChange = (data: { userId: string; isOnline: boolean }) => {
            dispatch(updateUserStatus(data));
        };

        const handleTyping = (data: { conversationId: string; userId: string }) => {
            dispatch(userStartedTyping(data));
        };

        const handleStopTyping = (data: { conversationId: string; userId: string }) => {
            dispatch(userStoppedTyping(data));
        };

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleMessagesRead);
        socket.on('online_users', handleOnlineUsers);
        socket.on('user_status_change', handleUserStatusChange);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('messages_read', handleMessagesRead);
            socket.off('online_users', handleOnlineUsers);
            socket.off('user_status_change', handleUserStatusChange);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
        };
    }, [socket, dispatch]);
};
