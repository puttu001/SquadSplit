import { api } from '@services/api';
import type { Expense } from '@/types';

interface ExpenseFilters {
  page?:      number;
  limit?:     number;
  category?:  string;
  memberId?:  string;
  startDate?: string;
  endDate?:   string;
  search?:    string;
}

export interface ActivityExpense {
  id:          string;
  description: string;
  amount:      number;
  date:        string;
  createdAt:   string;
  paidBy:      { id: string; name: string };
  group:       { id: string; name: string; imageUrl: string | null };
}

export const expensesApi = {
  listAll: (): Promise<ActivityExpense[]> =>
    api.get('/expenses/all').then((r) => r.data.data),

  listByGroup: (groupId: string, filters: ExpenseFilters): Promise<{ expenses: Expense[]; total: number; page: number; limit: number }> =>
    api.get(`/expenses/group/${groupId}`, { params: filters }).then((r) => ({
      expenses: r.data.data,
      total:    r.data.pagination.total,
      page:     r.data.pagination.page,
      limit:    r.data.pagination.limit,
    })),

  getOne: (id: string): Promise<Expense> =>
    api.get(`/expenses/${id}`).then((r) => r.data.data),

  create: (body: unknown) =>
    api.post('/expenses', body).then((r) => r.data.data),

  update: (id: string, body: unknown) =>
    api.patch(`/expenses/${id}`, body).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/expenses/${id}`).then((r) => r.data),
};
