import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/src/infra/realtime/socket-provider';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { receiveMessage, markMessagesAsRead, setOnlineUsers, updateUserStatus, userStartedTyping, userStoppedTyping, setActiveConversation } from '../services/chat-slice';
import { ChatMessage } from '../services/chat-types';
import { toast } from 'sonner';

interface ExtendedChatMessage extends ChatMessage {
    sender_name?: string;
    sender_avatar?: string;
}

export const useChatRealtime = () => {
    const { socket } = useSocket();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { activeConversationId } = useAppSelector((state) => state.chat);

    // Use refs to access latest state inside effect without triggering re-runs
    const activeConversationIdRef = useRef(activeConversationId);
    const userRef = useRef(user);

    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
        userRef.current = user;
    }, [activeConversationId, user]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: { conversation_id: string; message: ExtendedChatMessage }) => {
            dispatch(receiveMessage({
                conversationId: data.conversation_id,
                message: data.message
            }));

            const currentUser = userRef.current;
            const currentActiveConvId = activeConversationIdRef.current;


            // Play sound if message is not from me
            if (currentUser && data.message.sender_id !== currentUser.id) {
                try {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                    audio.play().catch(e => console.log('Audio autoplay blocked', e));
                } catch (error) {
                    console.error('Error playing chat sound', error);
                }

                // Show Toast ONLY if it's NOT the active conversation
                if (data.conversation_id !== currentActiveConvId && data.message.sender_name) {
                    toast(data.message.sender_name, {
                        description: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? '...' : ''),
                        action: {
                            label: 'Répondre',
                            onClick: () => {
                                dispatch(setActiveConversation(data.conversation_id));
                                router.push('/messages');
                            }
                        },
                    });
                }
            }
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
    }, [socket, dispatch, router]); // Removed user and activeConversationId from dependencies
};
