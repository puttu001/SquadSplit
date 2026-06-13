import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/error.middleware';
import { computeGroupBalances, simplifyDebts } from '../../shared/utils/debt';

export class AnalyticsService {
  async getGroupBalances(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');

    const expenses = await prisma.expense.findMany({
      where:   { groupId, isDeleted: false },
      select:  { paidById: true, splits: { select: { userId: true, amount: true } } },
    });

    const rawExpenses = expenses.map((e) => ({
      paidById: e.paidById,
      splits:   e.splits.map((s) => ({ userId: s.userId, amount: Number(s.amount) })),
    }));

    const balances     = computeGroupBalances(rawExpenses);
    const transactions = simplifyDebts([...balances]);

    return { balances, simplifiedTransactions: transactions };
  }

  async getDashboard(userId: string) {
    const [groups, totalOwed, totalReceivable, recentExpenses] = await Promise.all([
      prisma.groupMember.count({ where: { userId } }),

      prisma.expenseSplit.aggregate({
        where:  { userId, expense: { isDeleted: false }, isPaid: false },
        _sum:   { amount: true },
      }),

      prisma.expenseSplit.aggregate({
        where:  { expense: { paidById: userId, isDeleted: false }, isPaid: false },
        _sum:   { amount: true },
      }),

      prisma.expense.findMany({
        where:   {
          splits:    { some: { userId } },
          isDeleted: false,
        },
        include: {
          paidBy: { select: { id: true, name: true } },
          group:  { select: { id: true, name: true } },
        },
        orderBy: { date: 'desc' },
        take:    5,
      }),
    ]);

    return {
      groups,
      totalOwed:       Number(totalOwed._sum.amount ?? 0),
      totalReceivable: Number(totalReceivable._sum.amount ?? 0),
      recentExpenses,
    };
  }

  async getCategoryBreakdown(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');

    const breakdown = await prisma.expense.groupBy({
      by:     ['category'],
      where:  { groupId, isDeleted: false },
      _sum:   { amount: true },
      _count: { _all: true },
    });

    return breakdown.map((b) => ({
      category: b.category,
      total:    Number(b._sum.amount ?? 0),
      count:    b._count._all,
    }));
  }
}

export const analyticsService = new AnalyticsService();
