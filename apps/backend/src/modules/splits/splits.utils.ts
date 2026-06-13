import { AppError } from '../../shared/middleware/error.middleware';
import type { SPLIT_TYPES } from '../../config/constants';

type SplitType = typeof SPLIT_TYPES[number];

interface SplitEntry {
  userId:     string;
  amount?:    number;
  percentage?: number;
  shares?:    number;
}

interface ComputedSplit {
  userId:     string;
  amount:     number;
  percentage?: number;
  shares?:    number;
}

export function computeSplits(
  totalAmount: number,
  splitType: SplitType,
  splits: SplitEntry[],
): ComputedSplit[] {
  switch (splitType) {
    case 'EQUAL':      return computeEqual(totalAmount, splits);
    case 'EXACT':      return computeExact(totalAmount, splits);
    case 'PERCENTAGE': return computePercentage(totalAmount, splits);
    case 'SHARES':     return computeShares(totalAmount, splits);
  }
}

function computeEqual(total: number, splits: SplitEntry[]): ComputedSplit[] {
  const base  = parseFloat((total / splits.length).toFixed(2));
  const diff  = parseFloat((total - base * splits.length).toFixed(2));

  return splits.map((s, i) => ({
    userId: s.userId,
    amount: i === 0 ? parseFloat((base + diff).toFixed(2)) : base,
  }));
}

function computeExact(total: number, splits: SplitEntry[]): ComputedSplit[] {
  const sum = splits.reduce((acc, s) => acc + (s.amount ?? 0), 0);
  if (Math.abs(sum - total) > 0.01) {
    throw new AppError(400, `Exact split amounts (${sum}) don't add up to total (${total})`);
  }
  return splits.map((s) => ({ userId: s.userId, amount: s.amount! }));
}

function computePercentage(total: number, splits: SplitEntry[]): ComputedSplit[] {
  const sumPct = splits.reduce((acc, s) => acc + (s.percentage ?? 0), 0);
  if (Math.abs(sumPct - 100) > 0.01) {
    throw new AppError(400, `Percentages must sum to 100 (got ${sumPct})`);
  }

  const computed = splits.map((s) => ({
    userId:     s.userId,
    amount:     parseFloat(((s.percentage! / 100) * total).toFixed(2)),
    percentage: s.percentage,
  }));

  const diff = parseFloat((total - computed.reduce((a, c) => a + c.amount, 0)).toFixed(2));
  computed[0].amount = parseFloat((computed[0].amount + diff).toFixed(2));

  return computed;
}

function computeShares(total: number, splits: SplitEntry[]): ComputedSplit[] {
  const totalShares = splits.reduce((acc, s) => acc + (s.shares ?? 0), 0);
  if (totalShares === 0) throw new AppError(400, 'Total shares must be > 0');

  const computed = splits.map((s) => ({
    userId: s.userId,
    amount: parseFloat(((s.shares! / totalShares) * total).toFixed(2)),
    shares: s.shares,
  }));

  const diff = parseFloat((total - computed.reduce((a, c) => a + c.amount, 0)).toFixed(2));
  computed[0].amount = parseFloat((computed[0].amount + diff).toFixed(2));

  return computed;
}
