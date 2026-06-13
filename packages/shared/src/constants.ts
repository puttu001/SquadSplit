export const EXPENSE_CATEGORIES = [
  'FOOD', 'GROCERY', 'TRAVEL', 'PETROL_FUEL', 'RENT',
  'UTILITIES', 'ELECTRICITY', 'INTERNET', 'SHOPPING',
  'ENTERTAINMENT', 'MEDICAL', 'EDUCATION', 'PARTY',
  'GIFTS', 'SUBSCRIPTION', 'MISCELLANEOUS',
] as const;

export const SPLIT_TYPES = ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'] as const;

export const CURRENCY = { code: 'INR', symbol: '₹', locale: 'en-IN' } as const;

export const CATEGORY_LABELS: Record<string, string> = {
  FOOD:          'Food',
  GROCERY:       'Grocery',
  TRAVEL:        'Travel',
  PETROL_FUEL:   'Petrol / Fuel',
  RENT:          'Rent',
  UTILITIES:     'Utilities',
  ELECTRICITY:   'Electricity',
  INTERNET:      'Internet',
  SHOPPING:      'Shopping',
  ENTERTAINMENT: 'Entertainment',
  MEDICAL:       'Medical',
  EDUCATION:     'Education',
  PARTY:         'Party',
  GIFTS:         'Gifts',
  SUBSCRIPTION:  'Subscription',
  MISCELLANEOUS: 'Miscellaneous',
};
