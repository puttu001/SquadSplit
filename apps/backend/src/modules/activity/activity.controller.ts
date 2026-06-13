import { Request, Response, NextFunction } from 'express';
import { activityService } from './activity.service';
import { sendSuccess } from '../../shared/utils/response';

export class ActivityController {
  async getGroupActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await activityService.getGroupActivity(
        req.params.groupId,
        req.user!.id,
        Number(req.query.limit) || 30,
      );
      sendSuccess(res, activities);
    } catch (err) { next(err); }
  }
}

export const activityController = new ActivityController();
