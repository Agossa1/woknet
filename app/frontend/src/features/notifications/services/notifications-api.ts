import { api } from "../../api/apiClients";
import { Notification } from "./notifications-types";

export const notificationsApi = {
    getNotifications: (limit: number = 20, offset: number = 0) =>
        api.get<Notification[]>(`/notifications?limit=${limit}&offset=${offset}`),

    getUnreadCount: () =>
        api.get<{ count: number }>("/notifications/unread-count"),

    markAsRead: (id: string) =>
        api.patch<{ success: boolean }>(`/notifications/${id}/read`, {}),

    markAllRead: () =>
        api.post<{ success: boolean }>("/notifications/mark-all-read", {}),

    deleteNotification: (id: string) =>
        api.delete<{ success: boolean }>(`/notifications/${id}`)
};
