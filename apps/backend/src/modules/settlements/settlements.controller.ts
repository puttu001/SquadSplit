import { Request, Response, NextFunction } from 'express';
import { settlementsService } from './settlements.service';
import { sendSuccess } from '../../shared/utils/response';

export class SettlementsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await settlementsService.createSettlement(req.user!.id, req.body);
      sendSuccess(res, s, 'Settlement recorded', 201);
    } catch (err) { next(err); }
  }

  async listByGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await settlementsService.getGroupSettlements(req.params.groupId, req.user!.id);
      sendSuccess(res, s);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await settlementsService.updateSettlement(req.params.id, req.user!.id, req.body);
      sendSuccess(res, s, 'Settlement updated');
    } catch (err) { next(err); }
  }

  async getUpiLink(req: Request, res: Response, next: NextFunction) {
    try {
      const link = await settlementsService.getUpiLink(req.params.id, req.user!.id);
      sendSuccess(res, { upiLink: link });
    } catch (err) { next(err); }
  }
}

export const settlementsController = new SettlementsController();
