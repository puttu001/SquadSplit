import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/error.middleware';
import { uploadAvatar } from '../../shared/utils/cloudinary';
import type { UpdateProfileInput } from './users.validation';

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, username: true, name: true,
        avatarUrl: true, phoneNumber: true, upiId: true,
        isEmailVerified: true, createdAt: true,
      },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async uploadAvatar(userId: string, fileBuffer: Buffer): Promise<string> {
    const url = await uploadAvatar(fileBuffer, userId);
    await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } });
    return url;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: input,
      select: { id: true, name: true, avatarUrl: true, phoneNumber: true, upiId: true },
    });
  }

  async searchUsers(query: string, excludeId: string) {
    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: excludeId } },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email:    { contains: query, mode: 'insensitive' } },
              { name:     { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: { id: true, username: true, name: true, avatarUrl: true },
      take: 10,
    });
  }

  async sendFriendRequest(senderId: string, usernameOrEmail: string) {
    const receiver = await prisma.user.findFirst({
      where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] },
    });
    if (!receiver) throw new AppError(404, 'User not found');
    if (receiver.id === senderId) throw new AppError(400, 'Cannot add yourself');

    // Already friends
    const alreadyFriends = await prisma.friendship.findFirst({
      where: { userId: senderId, friendId: receiver.id },
    });
    if (alreadyFriends) throw new AppError(409, 'Already friends');

    // Block only on PENDING requests (in either direction)
    const pending = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId: receiver.id, status: 'PENDING' },
          { senderId: receiver.id, receiverId: senderId, status: 'PENDING' },
        ],
      },
    });
    if (pending) throw new AppError(409, 'Friend request already sent');

    // Clean up stale accepted/rejected requests before creating fresh one
    await prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId, receiverId: receiver.id },
          { senderId: receiver.id, receiverId: senderId },
        ],
      },
    });

    return prisma.friendRequest.create({
      data: { senderId, receiverId: receiver.id },
    });
  }

  async respondFriendRequest(requestId: string, userId: string, action: 'accept' | 'reject') {
    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== userId) throw new AppError(404, 'Request not found');
    if (request.status !== 'PENDING') throw new AppError(400, 'Request already processed');

    if (action === 'accept') {
      await prisma.$transaction([
        prisma.friendRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } }),
        prisma.friendship.createMany({
          data: [
            { userId: request.senderId,   friendId: request.receiverId },
            { userId: request.receiverId, friendId: request.senderId   },
          ],
          skipDuplicates: true,
        }),
      ]);
    } else {
      await prisma.friendRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
    }
  }

  async getPendingRequests(userId: string) {
    return prisma.friendRequest.findMany({
      where:   { receiverId: userId, status: 'PENDING' },
      include: { sender: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      include: {
        friend: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });
    return friendships.map((f: { friend: { id: string; name: string; username: string | null; avatarUrl: string | null } }) => f.friend);
  }

  async removeFriend(userId: string, friendId: string) {
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
  }
}

export const usersService = new UsersService();
