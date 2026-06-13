import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/error.middleware';
import { buildUpiLink } from '../../shared/utils/upi';
import type { CreateSettlementInput, UpdateSettlementInput } from './settlements.validation';

export class SettlementsService {
  async createSettlement(payerId: string, input: CreateSettlementInput) {
    const [payerMember, payeeMember] = await Promise.all([
      prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: input.groupId, userId: payerId } } }),
      prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: input.groupId, userId: input.payeeId } } }),
    ]);

    if (!payerMember) throw new AppError(403, 'You are not a member of this group');
    if (!payeeMember) throw new AppError(400, 'Payee is not a member of this group');
    if (payerId === input.payeeId) throw new AppError(400, 'Cannot settle with yourself');

    return prisma.settlement.create({
      data: { ...input, payerId, status: 'PENDING' },
      include: {
        payer: { select: { id: true, name: true, upiId: true } },
        payee: { select: { id: true, name: true, upiId: true } },
      },
    });
  }

  async getGroupSettlements(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');

    return prisma.settlement.findMany({
      where:   { groupId },
      include: {
        payer: { select: { id: true, name: true, avatarUrl: true } },
        payee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSettlement(settlementId: string, userId: string, input: UpdateSettlementInput) {
    const settlement = await prisma.settlement.findUnique({ where: { id: settlementId } });
    if (!settlement) throw new AppError(404, 'Settlement not found');
    if (settlement.payeeId !== userId) throw new AppError(403, 'Only the payee can update this settlement');

    return prisma.settlement.update({ where: { id: settlementId }, data: input });
  }

  async getUpiLink(settlementId: string, userId: string) {
    const settlement = await prisma.settlement.findUnique({
      where:   { id: settlementId },
      include: { payee: { select: { upiId: true, name: true } } },
    });

    if (!settlement) throw new AppError(404, 'Settlement not found');
    if (settlement.payerId !== userId) throw new AppError(403, 'Only the payer can get the UPI link');
    if (!settlement.payee.upiId) throw new AppError(400, 'Payee has not set a UPI ID');

    return buildUpiLink({
      upiId:  settlement.payee.upiId,
      name:   settlement.payee.name,
      amount: Number(settlement.amount),
      note:   `SquadSplit settlement`,
    });
  }
}

export const settlementsService = new SettlementsService();
