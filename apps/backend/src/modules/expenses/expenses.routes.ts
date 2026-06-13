import { Router } from 'express';
import { expensesController } from './expenses.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createExpenseSchema, updateExpenseSchema, expenseFiltersSchema } from './expenses.validation';

const router = Router();

router.use(authenticate);

router.post('/',                  validate(createExpenseSchema),   expensesController.create);
router.get('/all',                                                 expensesController.listAll);
router.get('/group/:groupId',     validate(expenseFiltersSchema, 'query'), expensesController.listByGroup);
router.get('/:id',                                                 expensesController.getOne);
router.patch('/:id',              validate(updateExpenseSchema),   expensesController.update);
router.delete('/:id',                                              expensesController.delete);

export default router;
