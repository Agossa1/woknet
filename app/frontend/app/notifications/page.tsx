'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { fetchNotificationsThunk, markAllReadThunk, markAsReadThunk, deleteNotificationThunk } from '@/src/features/notifications/services/notifications-thunks';
import { NotificationType } from '@/src/features/notifications/services/notifications-types';
import { Heart, MessageSquare, Share2, UserPlus, Bell, Trash2, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPage() {
    const dispatch = useAppDispatch();
    const { notifications, loading } = useAppSelector((state) => state.notifications);

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

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.POST_LIKE:
            case NotificationType.COMMENT_LIKE:
                return <Heart size={18} className="text-pink-500 fill-pink-500" />;
            case NotificationType.POST_COMMENT:
                return <MessageSquare size={18} className="text-blue-500 fill-blue-500" />;
            case NotificationType.POST_SHARE:
                return <Share2 size={18} className="text-green-500" />;
            case NotificationType.NEW_FOLLOW:
                return <UserPlus size={18} className="text-purple-500" />;
            default:
                return <Bell size={18} className="text-gray-500" />;
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
                return <>{senderName} a commenté votre publication : <span className="text-gray-500 block mt-1">"{notification.content}"</span></>;
            case NotificationType.POST_SHARE:
                return <>{senderName} a partagé votre publication</>;
            case NotificationType.NEW_FOLLOW:
                return <>{senderName} a commencé à vous suivre</>;
            default:
                return <>{senderName} vous a envoyé une notification</>;
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
                <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full transition-colors"
                >
                    <Check size={16} /> Tout marquer comme lu
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading && notifications.length === 0 ? (
                    <div className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={32} />
                        <p className="text-gray-500">Chargement de vos notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} className="text-gray-300 dark:text-gray-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Tout est calme ici</h2>
                        <p className="text-gray-500">Vous n'avez aucune notification pour le moment.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`group flex items-start gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative ${!notification.is_read ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}
                            >
                                {!notification.is_read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                )}

                                <Link href={`/profile/${notification.sender_id}`} className="shrink-0">
                                    <div className="relative">
                                        <img
                                            src={notification.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.sender_name}`}
                                            alt={notification.sender_name}
                                            className="w-12 h-12 rounded-full border border-gray-100 dark:border-gray-800 object-cover"
                                        />
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-800">
                                            {getIcon(notification.type)}
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <Link
                                            href={notification.type === NotificationType.NEW_FOLLOW ? `/profile/${notification.sender_id}` : `/feed`}
                                            onClick={() => dispatch(markAsReadThunk(notification.id))}
                                            className="text-gray-700 dark:text-gray-300 leading-normal block hover:underline underline-offset-2 decoration-gray-400"
                                        >
                                            {renderNotificationContent(notification)}
                                        </Link>
                                        <button
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <p className="text-center text-gray-400 text-xs mt-8">
                    Vous avez vu toutes vos notifications récentes.
                </p>
            )}
        </div>
    );
}
