import { api } from '@services/api';

export const dashboardApi = {
  getDashboard: () =>
    api.get('/analytics/dashboard').then((r) => r.data.data),
};
