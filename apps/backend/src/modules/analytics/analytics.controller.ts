import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess } from '../../shared/utils/response';

export class AnalyticsController {
  async getGroupBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getGroupBalances(req.params.groupId, req.user!.id);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboard(req.user!.id);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  async getCategoryBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getCategoryBreakdown(req.params.groupId, req.user!.id);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }
}

export const analyticsController = new AnalyticsController();
