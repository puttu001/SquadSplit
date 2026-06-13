import { api } from '@services/api';
import type { Group } from '@/types';

export const groupsApi = {
  list: (): Promise<Group[]> =>
    api.get('/groups').then((r) => r.data.data),

  getOne: (id: string): Promise<Group> =>
    api.get(`/groups/${id}`).then((r) => r.data.data),

  create: (body: { name: string; description?: string }): Promise<Group> =>
    api.post('/groups', body).then((r) => r.data.data),

  update: (id: string, body: { name?: string; description?: string }) =>
    api.patch(`/groups/${id}`, body).then((r) => r.data.data),

  archive: (id: string) =>
    api.delete(`/groups/${id}/archive`).then((r) => r.data),

  addMember: (id: string, userId: string) =>
    api.post(`/groups/${id}/members`, { userId }).then((r) => r.data),

  removeMember: (id: string, userId: string) =>
    api.delete(`/groups/${id}/members/${userId}`).then((r) => r.data),

  leave: (id: string) =>
    api.delete(`/groups/${id}/leave`).then((r) => r.data),

  joinByInvite: (code: string) =>
    api.post(`/groups/join/${code}`).then((r) => r.data.data),

  assignAdmin: (id: string, userId: string) =>
    api.patch(`/groups/${id}/members/${userId}/admin`).then((r) => r.data),

  toggleSettle: (id: string) =>
    api.patch(`/groups/${id}/settle`).then((r) => r.data.data as { isSettled: boolean }),

  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post(`/groups/${id}/image`, form, {
      headers: { 'Content-Type': undefined },
    }).then((r) => r.data.data as { imageUrl: string });
  },
};
