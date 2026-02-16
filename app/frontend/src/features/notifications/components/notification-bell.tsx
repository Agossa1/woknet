'use client';

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchUnreadCountThunk } from '../services/notifications-thunks';
import { NotificationsDropdown } from './notifications-dropdown';

export const NotificationBell: React.FC = () => {
    const dispatch = useAppDispatch();
    const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
    const user = useAppSelector((state) => state.auth.user);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleClose = React.useCallback(() => {
        setIsDropdownOpen(false);
    }, []);

    useEffect(() => {
        if (user) {
            dispatch(fetchUnreadCountThunk());
        }
    }, [dispatch, user]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white outline outline-2 outline-white dark:outline-gray-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isDropdownOpen && (
                <NotificationsDropdown onClose={handleClose} />
            )}
        </div>
    );
};
