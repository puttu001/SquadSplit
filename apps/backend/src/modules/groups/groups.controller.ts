import { Request, Response, NextFunction } from 'express';
import { groupsService } from './groups.service';
import { sendSuccess } from '../../shared/utils/response';

export class GroupsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.createGroup(req.user!.id, req.body);
      sendSuccess(res, group, 'Group created', 201);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await groupsService.getUserGroups(req.user!.id);
      sendSuccess(res, groups);
    } catch (err) { next(err); }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.getGroupById(req.params.id, req.user!.id);
      sendSuccess(res, group);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.updateGroup(req.params.id, req.user!.id, req.body);
      sendSuccess(res, group, 'Group updated');
    } catch (err) { next(err); }
  }

  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('No file uploaded');
      const url = await groupsService.uploadGroupImage(req.params.id, req.user!.id, req.file.buffer);
      sendSuccess(res, { imageUrl: url }, 'Group image updated');
    } catch (err) { next(err); }
  }

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      await groupsService.archiveGroup(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Group archived');
    } catch (err) { next(err); }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      await groupsService.addMember(req.params.id, req.user!.id, req.body.userId);
      sendSuccess(res, null, 'Member added', 201);
    } catch (err) { next(err); }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await groupsService.removeMember(req.params.id, req.user!.id, req.params.userId);
      sendSuccess(res, null, 'Member removed');
    } catch (err) { next(err); }
  }

  async leave(req: Request, res: Response, next: NextFunction) {
    try {
      await groupsService.leaveGroup(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Left group');
    } catch (err) { next(err); }
  }

  async joinByInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.joinByInviteCode(req.params.code, req.user!.id);
      sendSuccess(res, group, 'Joined group');
    } catch (err) { next(err); }
  }

  async assignAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      await groupsService.assignAdmin(req.params.id, req.user!.id, req.params.userId);
      sendSuccess(res, null, 'Admin assigned');
    } catch (err) { next(err); }
  }

  async toggleSettle(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await groupsService.toggleSettle(req.params.id, req.user!.id);
      sendSuccess(res, { isSettled: group.isSettled }, group.isSettled ? 'Group marked as settled' : 'Group marked as active');
    } catch (err) { next(err); }
  }
}

export const groupsController = new GroupsController();
