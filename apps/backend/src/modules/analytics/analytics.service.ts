import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/error.middleware';
import { computeGroupBalances, simplifyDebts } from '../../shared/utils/debt';

export class AnalyticsService {
  async getGroupBalances(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');

    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { isSettled: true } });
    if (group?.isSettled) return { balances: [], simplifiedTransactions: [] };

    const expenses = await prisma.expense.findMany({
      where:   { groupId, isDeleted: false },
      select:  { paidById: true, splits: { select: { userId: true, amount: true } } },
    });

    const rawExpenses = expenses.map((e) => ({
      paidById: e.paidById,
      splits:   e.splits.map((s) => ({ userId: s.userId, amount: Number(s.amount) })),
    }));

    const balances     = computeGroupBalances(rawExpenses);
    const transactions = simplifyDebts(balances.map((b) => ({ ...b })));

    return { balances, simplifiedTransactions: transactions };
  }

  async getDashboard(userId: string) {
    const [groups, totalOwed, totalReceivable, recentExpenses] = await Promise.all([
      prisma.groupMember.count({ where: { userId } }),

      // Splits YOU owe = your splits on expenses where YOU did NOT pay (exclude settled groups)
      prisma.expenseSplit.aggregate({
        where:  { userId, isPaid: false, expense: { isDeleted: false, paidById: { not: userId }, group: { isSettled: false } } },
        _sum:   { amount: true },
      }),

      // Splits owed TO YOU = other people's splits on expenses YOU paid (exclude settled groups)
      prisma.expenseSplit.aggregate({
        where:  { userId: { not: userId }, isPaid: false, expense: { paidById: userId, isDeleted: false, group: { isSettled: false } } },
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
