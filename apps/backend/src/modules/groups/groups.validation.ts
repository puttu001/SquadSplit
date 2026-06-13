import { z } from 'zod';

export const createGroupSchema = z.object({
  name:        z.string().min(2).max(60),
  description: z.string().max(200).optional(),
});

export const updateGroupSchema = z.object({
  name:        z.string().min(2).max(60).optional(),
  description: z.string().max(200).optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().cuid(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
