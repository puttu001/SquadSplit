import { z } from 'zod';

export const createSettlementSchema = z.object({
  groupId: z.string().cuid(),
  payeeId: z.string().cuid(),
  amount:  z.number().positive(),
  notes:   z.string().max(200).optional(),
  upiRefId: z.string().max(100).optional(),
});

export const updateSettlementSchema = z.object({
  status:   z.enum(['COMPLETED', 'PARTIAL']).optional(),
  notes:    z.string().max(200).optional(),
  upiRefId: z.string().max(100).optional(),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type UpdateSettlementInput = z.infer<typeof updateSettlementSchema>;
