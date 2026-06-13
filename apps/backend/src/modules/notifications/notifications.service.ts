import { NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { emitToUser } from '../../socket/socket';

export class NotificationsService {
  async create(params: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: object;
  }) {
    const notification = await prisma.notification.create({ data: params });
    emitToUser(params.userId, 'notification:new', notification);
    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data:  { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data:  { isRead: true },
    });
  }
}

export const notificationsService = new NotificationsService();
