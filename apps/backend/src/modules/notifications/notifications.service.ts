import { NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { messaging } from '../../config/firebase';
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
    this.sendPush(params.userId, params.title, params.body, params.data).catch(() => {});
    return notification;
  }

  private async sendPush(userId: string, title: string, body: string, data?: object) {
    if (!messaging) return;
    const tokens = await prisma.fcmToken.findMany({ where: { userId }, select: { token: true } });
    if (!tokens.length) return;

    const payload = {
      notification: { title, body },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined,
    };

    const response = await messaging.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      ...payload,
    });

    const staleTokens = response.responses
      .map((r: { success: boolean; error?: { code: string } }, i: number) =>
        !r.success && r.error?.code === 'messaging/registration-token-not-registered' ? tokens[i].token : null
      )
      .filter(Boolean) as string[];

    if (staleTokens.length) {
      await prisma.fcmToken.deleteMany({ where: { token: { in: staleTokens } } });
    }
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
