export const EXPENSE_CATEGORIES = [
  'FOOD', 'GROCERY', 'TRAVEL', 'PETROL_FUEL', 'RENT',
  'UTILITIES', 'ELECTRICITY', 'INTERNET', 'SHOPPING',
  'ENTERTAINMENT', 'MEDICAL', 'EDUCATION', 'PARTY',
  'GIFTS', 'SUBSCRIPTION', 'MISCELLANEOUS',
] as const;

export const SPLIT_TYPES = ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'] as const;

export const GROUP_ROLES = ['ADMIN', 'MEMBER'] as const;

export const SETTLEMENT_STATUSES = ['PENDING', 'COMPLETED', 'PARTIAL'] as const;

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const EMAIL_TEMPLATES = {
  VERIFY_EMAIL: 'verify-email',
  RESET_PASSWORD: 'reset-password',
  EXPENSE_ADDED: 'expense-added',
  SETTLEMENT_REMINDER: 'settlement-reminder',
} as const;
