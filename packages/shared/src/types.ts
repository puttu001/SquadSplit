export type ExpenseCategory = typeof import('./constants').EXPENSE_CATEGORIES[number];
export type SplitType       = typeof import('./constants').SPLIT_TYPES[number];

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}
