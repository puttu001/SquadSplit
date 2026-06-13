import { ActivityType } from '@prisma/client';
import { prisma } from '../../config/database';

export class ActivityService {
  async log(params: { userId: string; groupId?: string; type: ActivityType; data: object }) {
    return prisma.activity.create({ data: params });
  }

  async getGroupActivity(groupId: string, userId: string, limit = 30) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) return [];

    return prisma.activity.findMany({
      where:   { groupId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    });
  }
}

export const activityService = new ActivityService();
