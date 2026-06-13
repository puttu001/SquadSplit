import { Router } from 'express';
import { activityController } from './activity.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/group/:groupId', activityController.getGroupActivity);

export default router;
