'use client';

import { useEffect } from 'react';
import { useSocket } from '@/src/infra/realtime/socket-provider';
import { useAppDispatch } from '@/src/store/hooks';
import { fetchUnreadCountThunk, fetchNotificationsThunk } from '../services/notifications-thunks';
import { incrementUnreadCount } from '../services/notifications-slice';

export const useNotificationsRealtime = () => {
    const { socket } = useSocket();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!socket) return;

        // Listen for new notifications
        socket.on('new_notification', () => {
            dispatch(incrementUnreadCount());
            // Optionally fetch notifications to update the list if it's open
            // but for now just incrementing the bell counter is enough
            // and the user can click to refresh
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket, dispatch]);
};
