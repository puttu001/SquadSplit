import { prisma } from '../../config/database';
import { AppError } from '../../shared/middleware/error.middleware';
import { uploadGroupImage } from '../../shared/utils/cloudinary';
import { emitToGroup } from '../../socket/socket';
import { notificationsService } from '../notifications/notifications.service';
import type { CreateGroupInput, UpdateGroupInput } from './groups.validation';

export class GroupsService {
  async createGroup(userId: string, input: CreateGroupInput) {
    return prisma.group.create({
      data: {
        ...input,
        members: { create: [{ userId, role: 'ADMIN' }] },
      },
      include: { members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
    });
  }

  async getUserGroups(userId: string) {
    return prisma.group.findMany({
      where:   { members: { some: { userId } }, isArchived: false },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        _count:  { select: { expenses: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getGroupById(groupId: string, userId: string) {
    await this.assertMember(groupId, userId);
    return prisma.group.findUnique({
      where:   { id: groupId },
      include: { members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } } },
    });
  }

  async updateGroup(groupId: string, userId: string, input: UpdateGroupInput) {
    await this.assertAdmin(groupId, userId);
    return prisma.group.update({ where: { id: groupId }, data: input });
  }

  async uploadGroupImage(groupId: string, userId: string, fileBuffer: Buffer): Promise<string> {
    await this.assertAdmin(groupId, userId);
    const url = await uploadGroupImage(fileBuffer, groupId);
    await prisma.group.update({ where: { id: groupId }, data: { imageUrl: url } });
    return url;
  }

  async archiveGroup(groupId: string, userId: string) {
    await this.assertAdmin(groupId, userId);
    return prisma.group.update({ where: { id: groupId }, data: { isArchived: true } });
  }

  async toggleSettle(groupId: string, userId: string) {
    await this.assertAdmin(groupId, userId);
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { isSettled: true, name: true } });
    if (!group) throw new AppError(404, 'Group not found');

    const updated = await prisma.group.update({ where: { id: groupId }, data: { isSettled: !group.isSettled } });

    emitToGroup(groupId, 'group:settled', { groupId, isSettled: updated.isSettled });

    const status = updated.isSettled ? 'settled' : 'marked active';
    prisma.groupMember.findMany({ where: { groupId, userId: { not: userId } }, select: { userId: true } })
      .then((members) => Promise.all(members.map((m) =>
        notificationsService.create({
          userId: m.userId,
          type:   'GROUP_INVITE',
          title:  `Group ${updated.isSettled ? 'settled' : 'active'}`,
          body:   `"${group.name}" has been ${status}`,
          data:   { groupId },
        })
      ))).catch(() => {});

    return updated;
  }

  async addMember(groupId: string, adminId: string, newUserId: string) {
    await this.assertAdmin(groupId, adminId);
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: newUserId } },
    });
    if (existing) throw new AppError(409, 'User is already a member');
    const result = await prisma.groupMember.create({ data: { groupId, userId: newUserId } });

    prisma.group.findUnique({ where: { id: groupId }, select: { name: true } }).then((group) => {
      notificationsService.create({
        userId: newUserId,
        type:   'GROUP_INVITE',
        title:  'Added to a group',
        body:   `You were added to "${group?.name}"`,
        data:   { groupId },
      });
    }).catch(() => {});

    return result;
  }

  async removeMember(groupId: string, adminId: string, targetUserId: string) {
    await this.assertAdmin(groupId, adminId);
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { name: true } });
    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });

    notificationsService.create({
      userId: targetUserId,
      type:   'MEMBER_REMOVED',
      title:  'Removed from group',
      body:   `You were removed from "${group?.name}"`,
      data:   { groupId },
    }).catch(() => {});
  }

  async leaveGroup(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new AppError(404, 'Not a member of this group');

    const admins = await prisma.groupMember.count({ where: { groupId, role: 'ADMIN' } });
    if (member.role === 'ADMIN' && admins === 1) {
      throw new AppError(400, 'Assign another admin before leaving');
    }

    await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId } } });
  }

  async joinByInviteCode(inviteCode: string, userId: string) {
    const group = await prisma.group.findUnique({ where: { inviteCode } });
    if (!group) throw new AppError(404, 'Invalid invite code');

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
    });
    if (existing) throw new AppError(409, 'Already a member');

    await prisma.groupMember.create({ data: { groupId: group.id, userId } });
    return group;
  }

  async assignAdmin(groupId: string, adminId: string, targetUserId: string) {
    await this.assertAdmin(groupId, adminId);
    return prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      data:  { role: 'ADMIN' },
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────
  private async assertMember(groupId: string, userId: string) {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new AppError(403, 'Not a member of this group');
    return member;
  }

  private async assertAdmin(groupId: string, userId: string) {
    const member = await this.assertMember(groupId, userId);
    if (member.role !== 'ADMIN') throw new AppError(403, 'Admin rights required');
    return member;
  }
}

export const groupsService = new GroupsService();
