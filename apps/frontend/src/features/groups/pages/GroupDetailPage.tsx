import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { groupsApi }    from '../groups.api';
import { expensesApi }  from '@features/expenses/expenses.api';
import { analyticsApi } from '@features/analytics/analytics.api';
import { friendsApi }   from '@features/friends/friends.api';
import { Avatar }       from '@components/ui';
import { formatCurrency } from '@utils/currency';
import { formatDateInput } from '@utils/date';
import { joinGroupRoom, leaveGroupRoom } from '@hooks/useSocket';
import { useAuthStore }  from '@store/auth.store';
import type { ExpenseCategory } from '@/types';

// ─── Category config ──────────────────────────────────────────────────────────
const CAT: Record<ExpenseCategory, { bg: string; color: string; path: string }> = {
  FOOD:          { bg: 'bg-orange-100', color: 'text-orange-600', path: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  GROCERY:       { bg: 'bg-green-100',  color: 'text-green-600',  path: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
  TRAVEL:        { bg: 'bg-blue-100',   color: 'text-blue-600',   path: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  PETROL_FUEL:   { bg: 'bg-yellow-100', color: 'text-yellow-600', path: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  RENT:          { bg: 'bg-purple-100', color: 'text-purple-600', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  UTILITIES:     { bg: 'bg-teal-100',   color: 'text-teal-600',   path: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ELECTRICITY:   { bg: 'bg-yellow-100', color: 'text-yellow-600', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
  INTERNET:      { bg: 'bg-indigo-100', color: 'text-indigo-600', path: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
  SHOPPING:      { bg: 'bg-pink-100',   color: 'text-pink-600',   path: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  ENTERTAINMENT: { bg: 'bg-purple-100', color: 'text-purple-600', path: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
  MEDICAL:       { bg: 'bg-red-100',    color: 'text-red-600',    path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  EDUCATION:     { bg: 'bg-blue-100',   color: 'text-blue-600',   path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  PARTY:         { bg: 'bg-pink-100',   color: 'text-pink-600',   path: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  GIFTS:         { bg: 'bg-rose-100',   color: 'text-rose-600',   path: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
  SUBSCRIPTION:  { bg: 'bg-gray-100',   color: 'text-gray-600',   path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  MISCELLANEOUS: { bg: 'bg-gray-100',   color: 'text-gray-600',   path: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z' },
};

function CategoryIcon({ category, size = 'md' }: { category: ExpenseCategory; size?: 'sm' | 'md' }) {
  const c   = CAT[category] ?? CAT.MISCELLANEOUS;
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const ico = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className={`${dim} ${c.bg} rounded-full flex items-center justify-center shrink-0`}>
      <svg className={`${ico} ${c.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={c.path} />
      </svg>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BalancesData {
  balances?:               Array<{ userId: string; amount: number }>;
  simplifiedTransactions?: Array<{ from: string; to: string; amount: number }>;
}

type Member = { id: string; userId: string; role: string; user: { id: string; name: string; avatarUrl?: string } };

const CATS: ExpenseCategory[] = [
  'FOOD','GROCERY','TRAVEL','PETROL_FUEL','RENT','UTILITIES','ELECTRICITY',
  'INTERNET','SHOPPING','ENTERTAINMENT','MEDICAL','EDUCATION','PARTY','GIFTS',
  'SUBSCRIPTION','MISCELLANEOUS',
];
const fmtLabel = (c: string) =>
  c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

// ─── Add Expense Modal ────────────────────────────────────────────────────────
function AddExpenseModal({
  open, onClose, groupId, members,
}: {
  open:    boolean;
  onClose: () => void;
  groupId: string;
  members: Member[];
}) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [description, setDescription]   = useState('');
  const [amount, setAmount]             = useState('');
  const [category, setCategory]         = useState<ExpenseCategory>('MISCELLANEOUS');
  const [date, setDate]                 = useState('');
  const [paidByUserId, setPaidByUserId] = useState('');
  const [splitAll, setSplitAll]         = useState(true);
  const [splitIds, setSplitIds]         = useState<Set<string>>(new Set());
  const [errs, setErrs]                     = useState<Record<string, string>>({});
  const [showPaidByMenu, setShowPaidByMenu] = useState(false);

  useEffect(() => {
    if (open) {
      setDescription('');
      setAmount('');
      setCategory('MISCELLANEOUS');
      setDate(formatDateInput(new Date()));
      setPaidByUserId(currentUser?.id ?? '');
      setSplitAll(true);
      setSplitIds(new Set(members.map((m) => m.userId)));
      setErrs({});
      setShowPaidByMenu(false);
    }
  }, [open, currentUser?.id, members]);

  const create = useMutation({
    mutationFn: (body: unknown) => expensesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Expense added!');
      onClose();
    },
    onError: () => toast.error('Failed to add expense'),
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!description.trim())                      e.description = 'Description is required';
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0)        e.amount      = 'Enter a valid amount';
    if (!splitAll && splitIds.size === 0)         e.splits      = 'Select at least one person';
    return e;
  }

  function submit() {
    const validation = validate();
    if (Object.keys(validation).length > 0) { setErrs(validation); return; }
    const activeSplitIds = splitAll ? members.map((m) => m.userId) : [...splitIds];
    create.mutate({
      description: description.trim(),
      amount:      parseFloat(amount),
      category,
      date,
      groupId,
      paidByUserId,
      splitType:   'EQUAL',
      splits:      activeSplitIds.map((userId) => ({ userId })),
    });
  }

  if (!open) return null;

  const parsedAmt  = parseFloat(amount) || 0;
  const splitCount = splitAll ? members.length : splitIds.size;
  const perPerson  = splitCount > 0 ? parsedAmt / splitCount : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md z-10 flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Add Expense</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <input
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrs((p) => ({ ...p, description: '' })); }}
              placeholder="e.g. Dinner at restaurant"
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 ${errs.description ? 'border-red-400' : 'border-gray-200'}`}
            />
            {errs.description && <p className="text-xs text-red-500">{errs.description}</p>}
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-bold text-lg select-none">₹</span>
              <input
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrs((p) => ({ ...p, amount: '' })); }}
                type="number" step="0.01" min="0" placeholder="0.00"
                className={`w-full pl-9 pr-4 py-3.5 rounded-xl border text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-300 placeholder:font-normal ${errs.amount ? 'border-red-400' : 'border-gray-200'}`}
              />
            </div>
            {errs.amount && <p className="text-xs text-red-500">{errs.amount}</p>}
            {parsedAmt > 0 && splitCount > 0 && (
              <p className="text-xs text-gray-400">
                {formatCurrency(perPerson)} per person × {splitCount}
              </p>
            )}
          </div>

          {/* Paid by · Split — compact inline row */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Paid by [You ▾] */}
            <span className="text-sm text-gray-500">Paid by</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPaidByMenu((v) => !v)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
              >
                {paidByUserId === currentUser?.id
                  ? 'You'
                  : members.find((m) => m.userId === paidByUserId)?.user.name ?? 'You'}
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPaidByMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPaidByMenu(false)} />
                  <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[140px] py-1 overflow-hidden">
                    {members.map((m) => {
                      const isYou      = m.userId === currentUser?.id;
                      const isSelected = paidByUserId === m.userId;
                      return (
                        <button
                          key={m.userId}
                          type="button"
                          onClick={() => { setPaidByUserId(m.userId); setShowPaidByMenu(false); }}
                          className={`flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-left transition-colors ${
                            isSelected ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span className={isSelected ? '' : 'ml-5'}>{isYou ? 'You' : m.user.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <span className="text-gray-300 text-sm">·</span>

            {/* Split [Equally ▾] / [Custom ▾] */}
            <span className="text-sm text-gray-500">Split</span>
            <button
              type="button"
              onClick={() => {
                const next = !splitAll;
                setSplitAll(next);
                if (next) setSplitIds(new Set(members.map((m) => m.userId)));
                setErrs((p) => ({ ...p, splits: '' }));
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
            >
              {splitAll ? 'Equally' : 'Custom'}
              <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Custom member checkboxes (shown when split = Custom) */}
          {!splitAll && (
            <div className="flex flex-col gap-1.5">
              {errs.splits && <p className="text-xs text-red-500">{errs.splits}</p>}
              {members.map((m) => {
                const isYou     = m.userId === currentUser?.id;
                const isChecked = splitIds.has(m.userId);
                return (
                  <label
                    key={m.userId}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-all select-none ${
                      isChecked ? 'border-teal-300 bg-teal-50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setSplitIds((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(m.userId);
                          else next.delete(m.userId);
                          return next;
                        });
                        setErrs((p) => ({ ...p, splits: '' }));
                      }}
                      className="w-4 h-4 rounded accent-teal-600 shrink-0"
                    />
                    <Avatar name={m.user.name} src={m.user.avatarUrl} size="xs" />
                    <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                      {m.user.name}{isYou && <span className="text-gray-400 font-normal"> (You)</span>}
                    </span>
                    {isChecked && parsedAmt > 0 && splitIds.size > 0 && (
                      <span className="text-xs font-semibold text-teal-700 shrink-0">
                        {formatCurrency(parsedAmt / splitIds.size)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {/* Category + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
              >
                {CATS.map((c) => <option key={c} value={c}>{fmtLabel(c)}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
              />
            </div>
          </div>

        </div>

        {/* ── Footer: submit ── */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={submit}
            disabled={create.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {create.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Adding…
              </>
            ) : (
              <>Add Expense{parsedAmt > 0 ? ` · ${formatCurrency(parsedAmt)}` : ''}</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({
  open, onClose, inviteCode, groupId, memberUserIds,
}: {
  open: boolean; onClose: () => void; inviteCode: string;
  groupId: string; memberUserIds: string[];
}) {
  const queryClient = useQueryClient();
  const link = `${window.location.origin}/join/${inviteCode}`;
  const copy = () => { navigator.clipboard.writeText(link); toast.success('Invite link copied!'); };

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn:  friendsApi.list,
    enabled:  open,
  });

  const [adding, setAdding] = useState<Set<string>>(new Set());
  const [added,  setAdded]  = useState<Set<string>>(new Set());

  const notInGroup = friends.filter((f) => !memberUserIds.includes(f.id));

  async function addFriend(friendId: string) {
    setAdding((s) => new Set(s).add(friendId));
    try {
      await groupsApi.addMember(groupId, friendId);
      setAdded((s) => new Set(s).add(friendId));
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toast.success('Friend added to group!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add friend');
    } finally {
      setAdding((s) => { const n = new Set(s); n.delete(friendId); return n; });
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm z-10 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Invite Members</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

          {/* ── Add friends directly ── */}
          {notInGroup.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add from friends</p>
              <div className="flex flex-col gap-2">
                {notInGroup.map((f) => {
                  const isAdded   = added.has(f.id);
                  const isAdding  = adding.has(f.id);
                  return (
                    <div key={f.id} className="flex items-center gap-3 py-1">
                      <Avatar name={f.name} src={f.avatarUrl ?? undefined} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{f.name}</p>
                        {f.username && <p className="text-xs text-gray-400">@{f.username}</p>}
                      </div>
                      <button
                        disabled={isAdded || isAdding}
                        onClick={() => addFriend(f.id)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isAdded
                            ? 'bg-gray-100 text-gray-400 cursor-default'
                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        {isAdded ? (
                          <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>Added</>
                        ) : isAdding ? '…' : (
                          <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>Add</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or share invite link</span>
            </div>
          </div>

          {/* ── Invite link ── */}
          <div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-3">
              <p className="text-xs text-gray-600 flex-1 truncate">{link}</p>
            </div>
            <button
              onClick={copy}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Invite Link
            </button>
            <div className="mt-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
              <p className="text-xs text-teal-700 font-medium">Invite code: <span className="font-bold tracking-widest">{inviteCode}</span></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Members Modal ────────────────────────────────────────────────────────────
function MembersModal({
  open, onClose, members, currentUserId,
}: {
  open:          boolean;
  onClose:       () => void;
  members:       { id: string; userId: string; role: string; user: { id: string; name: string; avatarUrl?: string } }[];
  currentUserId: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm z-10 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Members ({members.length})</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col divide-y divide-gray-50">
          {members.map((m) => {
            const isYou   = m.userId === currentUserId;
            const isAdmin = m.role === 'ADMIN';
            return (
              <div key={m.id} className="flex items-center gap-3 py-3">
                <Avatar name={m.user.name} src={m.user.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {m.user.name}{isYou ? <span className="text-gray-400 font-normal"> (You)</span> : ''}
                  </p>
                  {isAdmin && <p className="text-xs text-teal-600 font-medium">Admin</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Group Modal ─────────────────────────────────────────────────────────
function EditGroupModal({
  open, onClose, group,
}: {
  open:    boolean;
  onClose: () => void;
  group:   { id: string; name: string; description?: string | null; imageUrl?: string | null };
}) {
  const queryClient  = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [preview, setPreview]   = useState<string | null>(null);
  const [imageFile, setFile]    = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setName(group.name);
      setDesc(group.description ?? '');
      setPreview(null);
      setFile(null);
    }
  }, [open, group]);

  const saveInfo = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      groupsApi.update(group.id, data),
    onError: () => toast.error('Failed to update group'),
  });

  const saveImage = useMutation({
    mutationFn: (file: File) => groupsApi.uploadImage(group.id, file),
    onError: () => toast.error('Failed to upload group image'),
  });

  async function handleSave() {
    if (!name.trim()) return;
    try {
      await saveInfo.mutateAsync({ name: name.trim(), description: desc.trim() });
      if (imageFile) await saveImage.mutateAsync(imageFile);
      queryClient.invalidateQueries({ queryKey: ['group', group.id] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group updated');
      onClose();
    } catch {}
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  const isPending = saveInfo.isPending || saveImage.isPending;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Edit Group</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">

          {/* ── Group image ── */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                {preview || group.imageUrl
                  ? <img src={preview ?? group.imageUrl!} alt="Group" className="w-full h-full object-cover" />
                  : <span className="text-3xl">{group.name.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u)?.[0] ?? '🏷️'}</span>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400">Tap the camera to change group photo</p>
          </div>

          {/* ── Name ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Group Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              maxLength={60}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            />
          </div>

          {/* ── Description ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description <span className="normal-case font-normal text-gray-400">(optional)</span></label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's this group for?"
              maxLength={200}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{desc.length}/200</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>Saving…</>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── More Options Modal ───────────────────────────────────────────────────────
function MoreOptionsModal({
  open, onClose, isAdmin, isSettled, onLeave, onArchive, onEdit, onToggleSettle,
}: {
  open:           boolean;
  onClose:        () => void;
  isAdmin:        boolean;
  isSettled:      boolean;
  onLeave:        () => void;
  onArchive:      () => void;
  onEdit:         () => void;
  onToggleSettle: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xs z-10">
        <div className="p-2">
          {/* Edit Group */}
          <button
            disabled={!isAdmin}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={onEdit}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Group{!isAdmin && <span className="ml-auto text-[10px] text-gray-400">Admin only</span>}
          </button>

          {/* Settle Up — admin only */}
          <button
            disabled={!isAdmin}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            onClick={() => { onClose(); onToggleSettle(); }}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSettled
                ? 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              } />
            </svg>
            {isSettled ? 'Mark as Active' : 'Mark as Settled'}
            {!isAdmin && <span className="ml-auto text-[10px] text-gray-400">Admin only</span>}
          </button>

          <div className="mx-4 border-t border-gray-100" />

          {/* Leave Group */}
          <button
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => { onClose(); if (confirm('Leave this group?')) onLeave(); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave Group
          </button>

          {isAdmin && (
            <button
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => { onClose(); if (confirm('Archive this group?')) onArchive(); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8m-9 4v4m4-4v4" />
              </svg>
              Archive Group
            </button>
          )}
        </div>
        <div className="p-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Simplified View Modal ────────────────────────────────────────────────────
function SimplifiedViewModal({
  open, onClose, balancesData, members, currentUserId,
}: {
  open:          boolean;
  onClose:       () => void;
  balancesData?: BalancesData;
  members:       { userId: string; user: { name: string; avatarUrl?: string } }[];
  currentUserId: string;
}) {
  if (!open) return null;
  const txns      = balancesData?.simplifiedTransactions ?? [];
  const memberMap = Object.fromEntries(members.map((m) => [m.userId, m.user]));

  const myTxns    = txns.filter((t) => t.from === currentUserId || t.to === currentUserId);
  const otherTxns = txns.filter((t) => t.from !== currentUserId && t.to !== currentUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md z-10 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Simplified View</h2>
            <p className="text-xs text-gray-400 mt-0.5">Minimum transfers to clear all debts</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex flex-col gap-4">
          {txns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-700">All clear! 🎉</p>
              <p className="text-xs text-gray-400 mt-1">No outstanding balances in this group</p>
            </div>
          ) : (
            <>
              {/* Your transactions highlighted */}
              {myTxns.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Your settlements</p>
                  <div className="flex flex-col gap-2">
                    {myTxns.map((t, i) => {
                      const fromUser  = memberMap[t.from];
                      const toUser    = memberMap[t.to];
                      const isYouFrom = t.from === currentUserId;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border ${isYouFrom ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isYouFrom ? 'bg-red-100' : 'bg-green-100'}`}>
                            <svg className={`w-4 h-4 ${isYouFrom ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isYouFrom ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {isYouFrom ? (
                                <>You pay <span className="text-green-700">{toUser?.name ?? t.to}</span></>
                              ) : (
                                <><span className="text-red-700">{fromUser?.name ?? t.from}</span> pays you</>
                              )}
                            </p>
                          </div>
                          <span className={`text-sm font-bold shrink-0 ${isYouFrom ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Number(t.amount))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other members' transactions */}
              {otherTxns.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Between others</p>
                  <div className="flex flex-col gap-2">
                    {otherTxns.map((t, i) => {
                      const fromUser = memberMap[t.from];
                      const toUser   = memberMap[t.to];
                      return (
                        <div key={i} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <Avatar name={fromUser?.name ?? t.from} src={fromUser?.avatarUrl} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">{fromUser?.name ?? t.from}</span>
                              <svg className="inline w-3.5 h-3.5 mx-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                              <span className="font-medium">{toUser?.name ?? t.to}</span>
                            </p>
                          </div>
                          <span className="text-sm font-bold text-gray-700 shrink-0">{formatCurrency(Number(t.amount))}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Compact stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, variant }: { label: string; value: string; variant: 'neutral' | 'owe' | 'owed' }) {
  const cfg = {
    neutral: { icon: 'bg-violet-50', color: 'text-violet-500', val: 'text-gray-900',   path: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    owe:     { icon: 'bg-red-50',    color: 'text-red-500',    val: 'text-red-500',    path: 'M7 17L17 7M17 7H7M17 7v10' },
    owed:    { icon: 'bg-green-50',  color: 'text-green-500',  val: 'text-green-600',  path: 'M17 7L7 17M7 17h10M7 17V7' },
  }[variant];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-2.5">
      <div className={`w-8 h-8 ${cfg.icon} rounded-full flex items-center justify-center shrink-0`}>
        <svg className={`w-4 h-4 ${cfg.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={cfg.path} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 font-medium leading-tight">{label}</p>
        <p className={`text-sm font-bold tabular-nums truncate leading-tight mt-0.5 ${cfg.val}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Cover gradient ───────────────────────────────────────────────────────────
const COVER_GRADIENTS = [
  'from-blue-400 to-cyan-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-600',
  'from-teal-400 to-emerald-600',
];
function groupGradient(id: string) {
  return COVER_GRADIENTS[id.charCodeAt(0) % COVER_GRADIENTS.length];
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function GroupDetailPage() {
  const { groupId = '' } = useParams();
  const navigate         = useNavigate();
  const queryClient      = useQueryClient();
  const user             = useAuthStore((s) => s.user);
  const currentUserId    = user?.id ?? '';

  const [showAddExpense,   setShowAddExpense]   = useState(false);
  const [showInvite,       setShowInvite]       = useState(false);
  const [showMembers,      setShowMembers]      = useState(false);
  const [showMore,         setShowMore]         = useState(false);
  const [showSimplified,   setShowSimplified]   = useState(false);
  const [showEdit,         setShowEdit]         = useState(false);

  useEffect(() => {
    joinGroupRoom(groupId);
    return () => leaveGroupRoom(groupId);
  }, [groupId]);

  const { data: group, isLoading: loadingGroup, error: groupError } = useQuery({
    queryKey:  ['group', groupId],
    queryFn:   () => groupsApi.getOne(groupId),
    enabled:   !!groupId,
    retry:     1,
    staleTime: 30_000,
  });

  const { data: expenseData } = useQuery({
    queryKey: ['expenses', groupId],
    queryFn:  () => expensesApi.listByGroup(groupId, { limit: 50 }),
    enabled:  !!groupId,
  });

  const { data: balancesData } = useQuery<BalancesData>({
    queryKey: ['balances', groupId],
    queryFn:  () => analyticsApi.getGroupBalances(groupId),
    enabled:  !!groupId,
  });

  const leaveGroup = useMutation({
    mutationFn: () => groupsApi.leave(groupId),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['groups'] }); navigate('/groups'); },
    onError:    () => toast.error('Failed to leave group'),
  });

  const archiveGroup = useMutation({
    mutationFn: () => groupsApi.archive(groupId),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['groups'] }); navigate('/groups'); },
    onError:    () => toast.error('Failed to archive group'),
  });

  const toggleSettle = useMutation({
    mutationFn: () => groupsApi.toggleSettle(groupId),
    onSuccess:  (data) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      toast.success(data.isSettled ? 'Group marked as settled' : 'Group marked as active');
    },
    onError: () => toast.error('Failed to update group status'),
  });

  if (loadingGroup) {
    return (
      <div className="flex flex-col gap-4 max-w-6xl mx-auto animate-pulse">
        <div className="h-5 w-28 bg-gray-200 rounded-lg" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(n => <div key={n} className="h-14 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }
  if (groupError || !group) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">Group not found</p>
          <p className="text-sm text-gray-500 mt-1">You may not be a member, or the group no longer exists.</p>
        </div>
        <Link to="/groups" className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors mt-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>
      </div>
    );
  }

  const expenses        = expenseData?.expenses ?? [];
  const members         = group.members;
  const isAdmin         = members.find((m) => m.userId === currentUserId)?.role === 'ADMIN';
  const isSettled       = group.isSettled ?? false;
  const emojiMatch      = group.name.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
  const emoji           = emojiMatch?.[0] ?? '';
  const gradient        = groupGradient(group.id);
  const groupTotalSpend = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const yourTotalSpend  = expenses.filter((e) => e.paidById === currentUserId).reduce((s, e) => s + Number(e.amount), 0);
  const userBalance     = balancesData?.balances?.find((b) => b.userId === currentUserId)?.amount ?? 0;
  const youOwe          = userBalance < 0 ? Math.abs(userBalance) : 0;
  const youAreOwed      = userBalance > 0 ? userBalance : 0;

  return (
    <>
      {/* Modals */}
      <AddExpenseModal    open={showAddExpense}  onClose={() => setShowAddExpense(false)}  groupId={groupId} members={members} />
      <InviteModal        open={showInvite}      onClose={() => setShowInvite(false)}      inviteCode={group.inviteCode} groupId={groupId} memberUserIds={members.map((m) => m.userId)} />
      <MembersModal       open={showMembers}     onClose={() => setShowMembers(false)}     members={members} currentUserId={currentUserId} />
      <SimplifiedViewModal open={showSimplified} onClose={() => setShowSimplified(false)}  balancesData={balancesData} members={members} currentUserId={currentUserId} />
      <MoreOptionsModal   open={showMore}        onClose={() => setShowMore(false)}        isAdmin={isAdmin} isSettled={isSettled} onLeave={() => leaveGroup.mutate()} onArchive={() => archiveGroup.mutate()} onEdit={() => { setShowMore(false); setShowEdit(true); }} onToggleSettle={() => toggleSettle.mutate()} />
      <EditGroupModal     open={showEdit}        onClose={() => setShowEdit(false)}        group={group} />

      <div className="max-w-6xl mx-auto flex flex-col gap-4">

        {/* ── Back link (desktop) ── */}
        <Link
          to="/groups"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>

        {/* ── Group header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${gradient} shrink-0 flex items-center justify-center overflow-hidden`}>
              {group.imageUrl
                ? <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                : <span className="text-xl sm:text-2xl">{emoji || '🏷️'}</span>
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Mobile: back arrow inline */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <button onClick={() => navigate('/groups')} className="sm:hidden text-gray-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{group.name}</h1>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isSettled
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isSettled ? 'Settled' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">
                {members.length} member{members.length !== 1 ? 's' : ''}
                {group.createdAt && (
                  <> · {new Date(group.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                )}
              </p>
              {group.description && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{group.description}</p>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Invite
              </button>
              <button
                onClick={() => setShowMore(true)}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile: quick action bar */}
          <div className="sm:hidden grid grid-cols-4 gap-1 mt-4 pt-3 border-t border-gray-100">
            {[
              { label: 'Invite',     icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',                                                                                                                                            action: () => setShowInvite(true)     },
              { label: 'Simplified', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',                        action: () => setShowSimplified(true) },
              { label: 'Members',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',                action: () => setShowMembers(true)    },
              { label: 'More',       icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',                                                                                                  action: () => setShowMore(true)       },
            ].map(({ label, icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center gap-1.5 py-1.5 text-gray-600 hover:text-teal-600 transition-colors"
              >
                <div className="w-9 h-9 bg-gray-100 hover:bg-teal-50 rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Group Total"  value={formatCurrency(groupTotalSpend)} variant="neutral" />
          <StatCard label="Your Spend"   value={formatCurrency(yourTotalSpend)}  variant="neutral" />
          <StatCard label="You Owe"      value={formatCurrency(youOwe)}          variant="owe"     />
          <StatCard label="You're Owed"  value={formatCurrency(youAreOwed)}      variant="owed"    />
        </div>

        {/* ── Expenses ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">
              Expenses{expenses.length > 0 ? ` (${expenses.length})` : ''}
            </h2>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-sm shadow-teal-600/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600">No expenses yet</p>
              <p className="text-xs text-gray-400 mt-1">Add the first expense for this group</p>
            </div>
          ) : (() => {
            // Group expenses by "Month Year"
            const groups: { label: string; items: typeof expenses }[] = [];
            for (const e of expenses) {
              const label = new Date(e.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
              const last  = groups[groups.length - 1];
              if (last && last.label === label) last.items.push(e);
              else groups.push({ label, items: [e] });
            }
            return (
              <div className="flex flex-col gap-3">
                {groups.map((group) => (
                  <div key={group.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Month header */}
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{group.label}</span>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {group.items.map((e) => {
                        const isYouPaid  = e.paidById === currentUserId;
                        const paidByName = isYouPaid ? 'You' : (e.paidBy?.name ?? '');
                        const userSplit  = e.splits?.find((s) => s.userId === currentUserId);

                        // Determine label + amount
                        let lentBorrowed: 'lent' | 'borrowed' | null = null;
                        let userAmount = 0;
                        if (userSplit) {
                          if (isYouPaid) {
                            const lent = Number(e.amount) - Number(userSplit.amount);
                            if (lent > 0.005) { lentBorrowed = 'lent'; userAmount = lent; }
                          } else {
                            if (Number(userSplit.amount) > 0.005) { lentBorrowed = 'borrowed'; userAmount = Number(userSplit.amount); }
                          }
                        }

                        // Date parts
                        const d     = new Date(e.date);
                        const mon   = d.toLocaleDateString('en-IN', { month: 'short' });
                        const day   = d.getDate().toString().padStart(2, '0');

                        return (
                          <div key={e.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 transition-colors">

                            {/* Date column */}
                            <div className="flex flex-col items-center w-7 shrink-0 text-center">
                              <span className="text-[9px] font-semibold text-gray-400 uppercase leading-none">{mon}</span>
                              <span className="text-sm font-bold text-gray-700 leading-tight">{day}</span>
                            </div>

                            {/* Category icon */}
                            <CategoryIcon category={e.category} size="sm" />

                            {/* Description + payer */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{e.description}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {paidByName} paid {formatCurrency(Number(e.amount))}
                              </p>
                            </div>

                            {/* You lent / you borrowed */}
                            {lentBorrowed ? (
                              <div className="flex flex-col items-end shrink-0 min-w-[72px]">
                                <span className="text-[10px] text-gray-400 leading-none mb-0.5">
                                  {lentBorrowed === 'lent' ? 'you lent' : 'you borrowed'}
                                </span>
                                <span className={`text-sm font-bold tabular-nums ${lentBorrowed === 'lent' ? 'text-green-600' : 'text-red-500'}`}>
                                  {formatCurrency(userAmount)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-300 shrink-0">not involved</span>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

      </div>
    </>
  );
}
