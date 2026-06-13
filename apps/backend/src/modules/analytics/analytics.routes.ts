import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard',                     analyticsController.getDashboard);
router.get('/group/:groupId/balances',       analyticsController.getGroupBalances);
router.get('/group/:groupId/categories',     analyticsController.getCategoryBreakdown);

export default router;
