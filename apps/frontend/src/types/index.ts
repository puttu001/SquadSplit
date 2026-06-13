// ─── Shared domain types mirrored from the backend ───────────────────────────

export type ExpenseCategory =
  | 'FOOD' | 'GROCERY' | 'TRAVEL' | 'PETROL_FUEL' | 'RENT'
  | 'UTILITIES' | 'ELECTRICITY' | 'INTERNET' | 'SHOPPING'
  | 'ENTERTAINMENT' | 'MEDICAL' | 'EDUCATION' | 'PARTY'
  | 'GIFTS' | 'SUBSCRIPTION' | 'MISCELLANEOUS';

export type SplitType       = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
export type GroupMemberRole = 'ADMIN' | 'MEMBER';
export type SettlementStatus = 'PENDING' | 'COMPLETED' | 'PARTIAL';

export interface UserSummary {
  id:        string;
  name:      string;
  username?: string;
  avatarUrl?: string;
}

export interface Group {
  id:          string;
  name:        string;
  description?: string;
  imageUrl?:   string;
  inviteCode:  string;
  isArchived:  boolean;
  isSettled:   boolean;
  createdAt:   string;
  updatedAt:   string;
  members:     GroupMember[];
  _count?:     { expenses: number };
}

export interface GroupMember {
  id:      string;
  groupId: string;
  userId:  string;
  role:    GroupMemberRole;
  user:    UserSummary;
}

export interface Expense {
  id:          string;
  groupId:     string;
  paidById:    string;
  amount:      number;
  description: string;
  notes?:      string;
  category:    ExpenseCategory;
  customTag?:  string;
  date:        string;
  isRecurring: boolean;
  createdAt:   string;
  paidBy:      UserSummary;
  splits:      ExpenseSplit[];
  group?:      { id: string; name: string };
}

export interface ExpenseSplit {
  id:         string;
  expenseId:  string;
  userId:     string;
  amount:     number;
  splitType:  SplitType;
  percentage?: number;
  shares?:    number;
  isPaid:     boolean;
  user:       UserSummary;
}

export interface Settlement {
  id:        string;
  groupId:   string;
  payerId:   string;
  payeeId:   string;
  amount:    number;
  notes?:    string;
  upiRefId?: string;
  status:    SettlementStatus;
  createdAt: string;
  payer:     UserSummary;
  payee:     UserSummary;
}

export interface Notification {
  id:        string;
  type:      string;
  title:     string;
  body:      string;
  isRead:    boolean;
  createdAt: string;
  data?:     Record<string, unknown>;
}

export interface Balance {
  userId: string;
  amount: number;
}

export interface Transaction {
  from:   string;
  to:     string;
  amount: number;
}

export interface ApiResponse<T> {
  success:    boolean;
  message:    string;
  data:       T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}
