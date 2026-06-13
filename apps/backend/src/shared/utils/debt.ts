// Debt simplification using the net-balance / greedy-settle algorithm.
// Reduces N*(N-1) pairwise debts to at most N-1 transactions.

export interface Balance {
  userId: string;
  amount: number; // positive = owed to this user; negative = this user owes
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export function simplifyDebts(balances: Balance[]): Transaction[] {
  const transactions: Transaction[] = [];
  const creditors = balances.filter((b) => b.amount > 0).sort((a, b) => b.amount - a.amount);
  const debtors   = balances.filter((b) => b.amount < 0).sort((a, b) => a.amount - b.amount);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i];
    const debt   = debtors[j];

    const amount = Math.min(credit.amount, -debt.amount);

    transactions.push({
      from:   debt.userId,
      to:     credit.userId,
      amount: parseFloat(amount.toFixed(2)),
    });

    credit.amount -= amount;
    debt.amount   += amount;

    if (Math.abs(credit.amount) < 0.01) i++;
    if (Math.abs(debt.amount)   < 0.01) j++;
  }

  return transactions;
}

export function computeGroupBalances(
  expenses: Array<{ paidById: string; splits: Array<{ userId: string; amount: number }> }>,
): Balance[] {
  const map = new Map<string, number>();

  for (const expense of expenses) {
    map.set(expense.paidById, (map.get(expense.paidById) ?? 0));

    for (const split of expense.splits) {
      if (split.userId === expense.paidById) continue;
      map.set(split.userId,     (map.get(split.userId)     ?? 0) - split.amount);
      map.set(expense.paidById, (map.get(expense.paidById) ?? 0) + split.amount);
    }
  }

  return Array.from(map.entries()).map(([userId, amount]) => ({ userId, amount }));
}
