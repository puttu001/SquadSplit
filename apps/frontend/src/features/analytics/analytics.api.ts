import { api } from '@services/api';

export const analyticsApi = {
  getDashboard: () =>
    api.get('/analytics/dashboard').then((r) => r.data.data),

  getGroupBalances: (groupId: string) =>
    api.get(`/analytics/group/${groupId}/balances`).then((r) => r.data.data),

  getCategoryBreakdown: (groupId: string) =>
    api.get(`/analytics/group/${groupId}/categories`).then((r) => r.data.data),
};
