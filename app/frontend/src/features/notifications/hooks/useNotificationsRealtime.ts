'use client';

import { useEffect } from 'react';
import { useSocket } from '@/src/infra/realtime/socket-provider';
import { useAppDispatch } from '@/src/store/hooks';
import { fetchUnreadCountThunk, fetchNotificationsThunk } from '../services/notifications-thunks';
import { incrementUnreadCount, addNotification } from '../services/notifications-slice';
import { toast } from 'sonner';
import { Notification, NotificationType } from '../services/notifications-types';
import { useRouter } from 'next/navigation';

export const useNotificationsRealtime = () => {
    const { socket } = useSocket();
    const dispatch = useAppDispatch();
    const router = useRouter();

    useEffect(() => {
        if (!socket) return;

        // Listen for new notifications
        socket.on('new_notification', (notification: Notification) => {
            dispatch(addNotification(notification));

            // Play notification sound
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio autoplay blocked', e));
            } catch (error) {
                console.error('Error playing notification sound', error);
            }

            // Show Toast (Skip for NEW_MESSAGE as it's handled by useChatRealtime with specific actions)
            if (notification && notification.sender_name && notification.type !== NotificationType.NEW_MESSAGE) {
                let message = "";
                let redirectUrl = "/feed";

                switch (notification.type) {
                    case NotificationType.POST_LIKE:
                        message = `a aimé votre post ${notification.content ? `(${notification.content})` : ''}`;
                        break;
                    case NotificationType.POST_COMMENT:
                        message = `a commenté : "${notification.content?.substring(0, 30)}..."`;
                        break;
                    case NotificationType.POST_SHARE:
                        message = `a partagé votre post`;
                        break;
                    case NotificationType.NEW_FOLLOW:
                        message = `commence à vous suivre`;
                        redirectUrl = `/profile/${notification.sender_id}`;
                        break;
                    default:
                        message = `vous a envoyé une notification`;
                }

                toast(notification.sender_name, {
                    description: message,
                    action: {
                        label: 'Voir',
                        onClick: () => {
                            router.push(redirectUrl);
                        }
                    },
                });
            }
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket, dispatch, router]);
};
