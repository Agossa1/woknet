'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchNotificationsThunk, markAllReadThunk, markAsReadThunk } from '../services/notifications-thunks';
import { NotificationType } from '../services/notifications-types';
import { Heart, MessageSquare, Share2, UserPlus, Bell, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationsDropdownProps {
    onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ onClose }) => {
    const dispatch = useAppDispatch();
    const { notifications, loading } = useAppSelector((state) => state.notifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchNotificationsThunk({ limit: 10 }));
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleMarkAllRead = () => {
        dispatch(markAllReadThunk());
    };

    const handleNotificationClick = (id: string) => {
        dispatch(markAsReadThunk(id));
        onClose();
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.POST_LIKE:
            case NotificationType.COMMENT_LIKE:
                return <Heart size={16} className="text-pink-500 fill-pink-500" />;
            case NotificationType.POST_COMMENT:
                return <MessageSquare size={16} className="text-blue-500 fill-blue-500" />;
            case NotificationType.POST_SHARE:
                return <Share2 size={16} className="text-green-500" />;
            case NotificationType.NEW_FOLLOW:
                return <UserPlus size={16} className="text-purple-500" />;
            default:
                return <Bell size={16} className="text-gray-500" />;
        }
    };

    const renderNotificationContent = (notification: any) => {
        const senderName = <span className="font-bold text-gray-900 dark:text-gray-100">{notification.sender_name}</span>;

        switch (notification.type) {
            case NotificationType.POST_LIKE:
                return <>{senderName} a aimé votre publication</>;
            case NotificationType.COMMENT_LIKE:
                return <>{senderName} a aimé votre commentaire</>;
            case NotificationType.POST_COMMENT:
                return <>{senderName} a commenté votre publication : <span className="text-gray-500 truncate block">"{notification.content}"</span></>;
            case NotificationType.POST_SHARE:
                return <>{senderName} a partagé votre publication</>;
            case NotificationType.NEW_FOLLOW:
                return <>{senderName} a commencé à vous suivre</>;
            default:
                return <>{senderName} vous a envoyé une notification</>;
        }
    };

    return (
        <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
        >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                    <Check size={14} /> Tout marquer comme lu
                </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
                {loading && notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Chargement...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">Aucune notification pour le moment</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {notifications.map((notification) => (
                            <Link
                                key={notification.id}
                                href={notification.type === NotificationType.NEW_FOLLOW ? `/profile/${notification.sender_id}` : `/feed`} // could be more specific
                                onClick={() => handleNotificationClick(notification.id)}
                                className={`flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative ${!notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                                {!notification.is_read && (
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                )}
                                <div className="relative shrink-0">
                                    <img
                                        src={notification.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.sender_name}`}
                                        alt={notification.sender_name}
                                        className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-800 object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-800">
                                        {getIcon(notification.type)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                                        {renderNotificationContent(notification)}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Link
                href="/notifications"
                onClick={onClose}
                className="block p-3 text-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 font-medium bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800"
            >
                Voir toutes les notifications
            </Link>
        </motion.div>
    );
};
