import { z } from 'zod';
import { EXPENSE_CATEGORIES, SPLIT_TYPES } from '../../config/constants';

const splitEntrySchema = z.object({
  userId:     z.string().cuid(),
  amount:     z.number().positive().optional(),
  percentage: z.number().min(0.01).max(100).optional(),
  shares:     z.number().int().min(1).optional(),
});

export const createExpenseSchema = z.object({
  groupId:      z.string().cuid(),
  paidByUserId: z.string().cuid().optional(), // omit → defaults to the authenticated user
  amount:       z.number().positive(),
  description:  z.string().min(1).max(200),
  notes:        z.string().max(500).optional(),
  category:     z.enum(EXPENSE_CATEGORIES).default('MISCELLANEOUS'),
  customTag:    z.string().max(30).optional(),
  date:         z.coerce.date(),
  isRecurring:  z.boolean().default(false),
  splitType:    z.enum(SPLIT_TYPES),
  splits:       z.array(splitEntrySchema).min(1),
});

export const updateExpenseSchema = createExpenseSchema.partial().omit({ groupId: true });

export const expenseFiltersSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  category:  z.enum(EXPENSE_CATEGORIES).optional(),
  memberId:  z.string().cuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate:   z.coerce.date().optional(),
  search:    z.string().optional(),
});

export type CreateExpenseInput  = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput  = z.infer<typeof updateExpenseSchema>;
export type ExpenseFiltersInput = z.infer<typeof expenseFiltersSchema>;
