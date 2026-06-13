import { z } from 'zod';

export const updateProfileSchema = z.object({
  name:        z.string().min(2).max(50).optional(),
  phoneNumber: z.union([
    z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number'),
    z.literal(''),
  ]).optional(),
  upiId:       z.string().max(50).optional(),
});

export const sendFriendRequestSchema = z.object({
  usernameOrEmail: z.string().min(1),
});

export const respondFriendRequestSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
