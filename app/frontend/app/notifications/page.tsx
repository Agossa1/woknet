'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchNotificationsThunk, markAllReadThunk, markAsReadThunk, deleteNotificationThunk } from '@/src/features/notifications/services/notifications-thunks';
import { NotificationType } from '@/src/features/notifications/services/notifications-types';
import { MoreHorizontal, Bell, Trash2, CheckCircle, Briefcase, MessageSquare, AtSign } from 'lucide-react';
import { setActiveConversation } from '@/src/features/chat/services/chat-slice';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPage() {
    const dispatch = useAppDispatch();
    const { notifications, loading } = useAppSelector((state) => state.notifications);
    const [filter, setFilter] = useState<'ALL' | 'JOBS' | 'POSTS' | 'MENTIONS'>('ALL');

    useEffect(() => {
        dispatch(fetchNotificationsThunk({ limit: 50 }));
    }, [dispatch]);

    const handleMarkAllRead = () => {
        dispatch(markAllReadThunk());
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Supprimer cette notification ?")) {
            dispatch(deleteNotificationThunk(id));
        }
    };

    // Filter logic
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'ALL') return true;
        if (filter === 'JOBS') return false; // Todo: Add Job type
        if (filter === 'POSTS') return [NotificationType.POST_LIKE, NotificationType.POST_COMMENT, NotificationType.POST_SHARE, NotificationType.COMMENT_LIKE].includes(n.type);
        if (filter === 'MENTIONS') return [NotificationType.POST_COMMENT, NotificationType.NEW_MESSAGE].includes(n.type);
        return true;
    });

    const renderNotificationContent = (notification: any) => {
        const senderName = <span className="font-semibold text-gray-900 dark:text-gray-100">{notification.sender_name}</span>;

        // Helper for summary text
        const Summary = ({ children }: { children: React.ReactNode }) => (
            <span className="text-gray-600 dark:text-gray-300">{children}</span>
        );

        switch (notification.type) {
            case NotificationType.POST_LIKE:
                return <>{senderName} <Summary>a aimé votre publication.</Summary></>;
            case NotificationType.COMMENT_LIKE:
                return <>{senderName} <Summary>a aimé votre commentaire.</Summary></>;
            case NotificationType.POST_COMMENT:
                return (
                    <div className="flex flex-col gap-1">
                        <span>{senderName} <Summary>a commenté votre publication :</Summary></span>
                        <span className="text-gray-500 dark:text-gray-400 line-clamp-2 text-sm pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                            "{notification.content}"
                        </span>
                    </div>
                );
            case NotificationType.POST_SHARE:
                return <>{senderName} <Summary>a partagé votre publication.</Summary></>;
            case NotificationType.NEW_FOLLOW:
                return <>{senderName} <Summary>a commencé à vous suivre.</Summary></>;
            case NotificationType.NEW_MESSAGE:
                return <>{senderName} <Summary>vous a envoyé un message.</Summary></>;
            default:
                return <>{senderName} <Summary>vous a envoyé une notification.</Summary></>;
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-6 px-4 font-sans">

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filter === 'ALL' ? 'bg-green-700 text-white border-green-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Toutes
                </button>
                <button
                    onClick={() => setFilter('JOBS')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filter === 'JOBS' ? 'bg-green-700 text-white border-green-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Offres d'emploi
                </button>
                <button
                    onClick={() => setFilter('POSTS')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filter === 'POSTS' ? 'bg-green-700 text-white border-green-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Mes posts
                </button>
                <button
                    onClick={() => setFilter('MENTIONS')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${filter === 'MENTIONS' ? 'bg-green-700 text-white border-green-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    Mentions
                </button>
            </div>

            {/* Notifications List Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading && filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center opacity-60">
                        <Bell size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aucune notification</h3>
                        <p className="text-gray-500">Vous êtes à jour !</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`relative group flex gap-4 p-4 transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                            >
                                {/* Unread Indicator */}
                                {!notification.is_read && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                                )}

                                {/* Start of Clickable Area */}
                                <div className="flex-1 flex gap-3 min-w-0">
                                    <Link href={`/profile/${notification.sender_id}`} className="shrink-0">
                                        <img
                                            src={notification.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.sender_name}`}
                                            alt={notification.sender_name}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                        />
                                    </Link>

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <Link
                                            href={
                                                notification.type === NotificationType.NEW_FOLLOW
                                                    ? `/profile/${notification.sender_id}`
                                                    : notification.type === NotificationType.NEW_MESSAGE
                                                        ? '/messages'
                                                        : '/feed'
                                            }
                                            onClick={() => {
                                                dispatch(markAsReadThunk(notification.id));
                                                if (notification.type === NotificationType.NEW_MESSAGE && notification.item_id) {
                                                    dispatch(setActiveConversation(notification.item_id));
                                                }
                                            }}
                                            className="block"
                                        >
                                            <div className="text-[15px] leading-snug">
                                                {renderNotificationContent(notification)}
                                            </div>

                                            {/* Preview box for certain types could go here if we had metadata */}
                                            {/* Example: Job Offer Preview Placeholder */}
                                            {/* <div className="mt-2 border rounded-md p-3 flex gap-3 items-center bg-white dark:bg-gray-800 max-w-md">...</div> */}

                                        </Link>
                                    </div>
                                </div>

                                {/* Meta & Actions */}
                                <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: false, locale: fr })
                                            .replace('environ ', '')
                                            .replace(' moins de', '')
                                        }
                                    </span>

                                    <div className="relative group/menu">
                                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 py-1 hidden group-hover/menu:block hover:block z-10 origin-top-right">
                                            <button
                                                onClick={(e) => handleDelete(notification.id, e)}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Supprimer
                                            </button>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => dispatch(markAsReadThunk(notification.id))}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                                                >
                                                    <CheckCircle size={14} /> Marquer comme lu
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-green-700 hover:text-green-800 dark:text-green-500 font-medium hover:underline"
                    >
                        Tout marquer comme lu
                    </button>
                </div>
            )}
        </div>
    );
}
