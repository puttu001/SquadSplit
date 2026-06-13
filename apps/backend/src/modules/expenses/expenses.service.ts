import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/error.middleware';
import { emitToGroup } from '../../socket/socket';
import { computeSplits } from '../splits/splits.utils';
import type { CreateExpenseInput, UpdateExpenseInput, ExpenseFiltersInput } from './expenses.validation';

export class ExpensesService {
  async createExpense(userId: string, input: CreateExpenseInput) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: input.groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');

    const computedSplits = computeSplits(input.amount, input.splitType, input.splits);

    const expense = await prisma.expense.create({
      data: {
        groupId:     input.groupId,
        paidById:    userId,
        amount:      input.amount,
        description: input.description,
        notes:       input.notes,
        category:    input.category,
        customTag:   input.customTag,
        date:        input.date,
        isRecurring: input.isRecurring,
        splits:      {
          create: computedSplits.map((s) => ({
            userId:     s.userId,
            amount:     s.amount,
            splitType:  input.splitType,
            percentage: s.percentage,
            shares:     s.shares,
          })),
        },
      },
      include: { paidBy: { select: { id: true, name: true } }, splits: true },
    });

    emitToGroup(input.groupId, 'expense:created', expense);
    return expense;
  }

  async getAllUserExpenses(userId: string, limit = 100) {
    const memberships = await prisma.groupMember.findMany({
      where:  { userId },
      select: { groupId: true },
    });
    const groupIds = memberships.map((m) => m.groupId);

    return prisma.expense.findMany({
      where:   { groupId: { in: groupIds }, isDeleted: false },
      include: {
        paidBy: { select: { id: true, name: true } },
        group:  { select: { id: true, name: true, imageUrl: true } },
      },
      orderBy: { date: 'desc' },
      take:    limit,
    });
  }

  async getGroupExpenses(groupId: string, userId: string, filters: ExpenseFiltersInput) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');

    const where: Prisma.ExpenseWhereInput = {
      groupId,
      isDeleted: false,
      ...(filters.category  && { category: filters.category }),
      ...(filters.memberId  && { splits: { some: { userId: filters.memberId } } }),
      ...(filters.startDate && { date: { gte: filters.startDate } }),
      ...(filters.endDate   && { date: { lte: filters.endDate } }),
      ...(filters.search    && {
        description: { contains: filters.search, mode: 'insensitive' as const },
      }),
    };

    const [expenses, total] = await prisma.$transaction([
      prisma.expense.findMany({
        where,
        include: {
          paidBy: { select: { id: true, name: true, avatarUrl: true } },
          splits: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { date: 'desc' },
        skip:  (filters.page - 1) * filters.limit,
        take:  filters.limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return { expenses, total, page: filters.page, limit: filters.limit };
  }

  async getExpenseById(expenseId: string, userId: string) {
    const expense = await prisma.expense.findUnique({
      where:   { id: expenseId },
      include: {
        paidBy: { select: { id: true, name: true, avatarUrl: true } },
        splits: { include: { user: { select: { id: true, name: true } } } },
        group:  { select: { id: true, name: true } },
      },
    });
    if (!expense || expense.isDeleted) throw new AppError(404, 'Expense not found');

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: expense.groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');

    return expense;
  }

  async updateExpense(expenseId: string, userId: string, input: UpdateExpenseInput) {
    const expense = await this.getExpenseById(expenseId, userId);
    if (expense.paidById !== userId) throw new AppError(403, 'Only the payer can edit this expense');

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        description: input.description,
        notes:       input.notes,
        category:    input.category,
        customTag:   input.customTag,
        date:        input.date,
      },
    });

    emitToGroup(expense.groupId, 'expense:updated', updated);
    return updated;
  }

  async deleteExpense(expenseId: string, userId: string) {
    const expense = await this.getExpenseById(expenseId, userId);

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: expense.groupId, userId } },
    });
    const isAdmin = member?.role === 'ADMIN';
    if (expense.paidById !== userId && !isAdmin) {
      throw new AppError(403, 'Insufficient permissions to delete this expense');
    }

    await prisma.expense.update({
      where: { id: expenseId },
      data:  { isDeleted: true, deletedAt: new Date() },
    });

    emitToGroup(expense.groupId, 'expense:deleted', { expenseId });
  }
}

export const expensesService = new ExpensesService();
