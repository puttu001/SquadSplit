import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/',                    notificationsController.list);
router.patch('/:id/read',          notificationsController.markRead);
router.patch('/read-all',          notificationsController.markAllRead);

export default router;
