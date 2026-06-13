import { api } from '@services/api';
import type { Notification } from '@/types';

export const notificationsApi = {
  list: (page = 1): Promise<{ notifications: Notification[]; unreadCount: number }> =>
    api.get('/notifications', { params: { page } }).then((r) => ({
      notifications: r.data.data,
      unreadCount:   r.data.unreadCount,
    })),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};
