import { Request, Response, NextFunction } from 'express';
import { expensesService } from './expenses.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class ExpensesController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expensesService.createExpense(req.user!.id, req.body);
      sendSuccess(res, expense, 'Expense created', 201);
    } catch (err) { next(err); }
  }

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const expenses = await expensesService.getAllUserExpenses(req.user!.id);
      sendSuccess(res, expenses);
    } catch (err) { next(err); }
  }

  async listByGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { expenses, total, page, limit } = await expensesService.getGroupExpenses(
        req.params.groupId, req.user!.id, req.query as never,
      );
      sendPaginated(res, expenses, total, page, limit);
    } catch (err) { next(err); }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expensesService.getExpenseById(req.params.id, req.user!.id);
      sendSuccess(res, expense);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await expensesService.updateExpense(req.params.id, req.user!.id, req.body);
      sendSuccess(res, expense, 'Expense updated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await expensesService.deleteExpense(req.params.id, req.user!.id);
      sendSuccess(res, null, 'Expense deleted');
    } catch (err) { next(err); }
  }
}

export const expensesController = new ExpensesController();
