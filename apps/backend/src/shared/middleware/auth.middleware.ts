import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'No token provided');
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    return sendError(res, 401, 'Invalid or expired token');
  }

  req.user = { id: payload.userId, email: payload.email };
  next();
}

export function requireGroupAdmin(req: Request, res: Response, next: NextFunction) {
  // Used on routes where group admin rights are needed.
  // The actual admin check is done inside the service after fetching GroupMember.
  // This middleware just ensures the user is authenticated first.
  if (!req.user) return sendError(res, 401, 'Unauthorized');
  next();
}
