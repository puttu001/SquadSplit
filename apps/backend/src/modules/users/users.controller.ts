import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../shared/utils/response';

export class UsersController {
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('No file uploaded');
      const url = await usersService.uploadAvatar(req.user!.id, req.file.buffer);
      sendSuccess(res, { avatarUrl: url }, 'Avatar updated');
    } catch (err) { next(err); }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getProfile(req.user!.id);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, user, 'Profile updated');
    } catch (err) { next(err); }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.searchUsers(req.query.q as string, req.user!.id);
      sendSuccess(res, users);
    } catch (err) { next(err); }
  }

  async sendFriendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.sendFriendRequest(req.user!.id, req.body.usernameOrEmail);
      sendSuccess(res, null, 'Friend request sent', 201);
    } catch (err) { next(err); }
  }

  async respondFriendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.respondFriendRequest(req.params.requestId, req.user!.id, req.body.action);
      sendSuccess(res, null, 'Friend request updated');
    } catch (err) { next(err); }
  }

  async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await usersService.getPendingRequests(req.user!.id);
      sendSuccess(res, requests);
    } catch (err) { next(err); }
  }

  async getFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const friends = await usersService.getFriends(req.user!.id);
      sendSuccess(res, friends);
    } catch (err) { next(err); }
  }

  async removeFriend(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.removeFriend(req.user!.id, req.params.friendId);
      sendSuccess(res, null, 'Friend removed');
    } catch (err) { next(err); }
  }
}

export const usersController = new UsersController();
