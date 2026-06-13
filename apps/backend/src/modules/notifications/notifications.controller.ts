import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { notifications, total, unreadCount, page, limit } =
        await notificationsService.getUserNotifications(
          req.user!.id,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        );
      res.json({ success: true, data: notifications, pagination: { total, page, limit }, unreadCount });
    } catch (err) { next(err); }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAsRead(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Marked as read');
    } catch (err) { next(err); }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationsService.markAllAsRead(req.user!.id);
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (err) { next(err); }
  }
}

export const notificationsController = new NotificationsController();
