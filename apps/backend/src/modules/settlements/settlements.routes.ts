import { Router } from 'express';
import { settlementsController } from './settlements.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createSettlementSchema, updateSettlementSchema } from './settlements.validation';

const router = Router();

router.use(authenticate);

router.post('/',                      validate(createSettlementSchema), settlementsController.create);
router.get('/group/:groupId',                                           settlementsController.listByGroup);
router.patch('/:id',                  validate(updateSettlementSchema), settlementsController.update);
router.get('/:id/upi-link',                                             settlementsController.getUpiLink);

export default router;
