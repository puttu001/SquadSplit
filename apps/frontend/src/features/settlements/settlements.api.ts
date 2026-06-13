import { api } from '@services/api';
import type { Settlement } from '@/types';

export const settlementsApi = {
  listByGroup: (groupId: string): Promise<Settlement[]> =>
    api.get(`/settlements/group/${groupId}`).then((r) => r.data.data),

  create: (body: { groupId: string; payeeId: string; amount: number; notes?: string }) =>
    api.post('/settlements', body).then((r) => r.data.data),

  update: (id: string, body: { status?: string; notes?: string }) =>
    api.patch(`/settlements/${id}`, body).then((r) => r.data.data),

  getUpiLink: (id: string): Promise<{ upiLink: string }> =>
    api.get(`/settlements/${id}/upi-link`).then((r) => r.data.data),
};
