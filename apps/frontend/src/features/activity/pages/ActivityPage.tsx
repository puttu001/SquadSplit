import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { expensesApi, type ActivityExpense } from '@features/expenses/expenses.api';
import { useAuthStore } from '@store/auth.store';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day:   d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date:  d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
  };
}

function timeAgo(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hrs   = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hrs  < 24)  return `${hrs}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function groupByDate(expenses: ActivityExpense[]) {
  const groups: { label: string; items: ActivityExpense[] }[] = [];
  for (const e of expenses) {
    const d         = new Date(e.date);
    const today     = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    let label: string;
    if (d.toDateString() === today.toDateString())         label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  }
  return groups;
}

// ─── Group avatar ─────────────────────────────────────────────────────────────
const GROUP_COLORS = [
  'bg-teal-100 text-teal-600',
  'bg-blue-100 text-blue-600',
  'bg-violet-100 text-violet-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
];
function GroupAvatar({ group }: { group: { id: string; name: string; imageUrl: string | null } }) {
  const color = GROUP_COLORS[group.id.charCodeAt(0) % GROUP_COLORS.length];
  if (group.imageUrl) {
    return (
      <img
        src={group.imageUrl}
        alt={group.name}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
    );
  }
  const emoji = group.name.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u)?.[0];
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base font-bold ${color}`}>
      {emoji ?? group.name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
function ActivityRow({ expense, currentUserId }: { expense: ActivityExpense; currentUserId: string }) {
  const { day, date, month } = fmtDate(expense.date);
  const isYou = expense.paidBy.id === currentUserId;
  const who   = isYou ? 'You' : expense.paidBy.name;

  return (
    <Link
      to={`/groups/${expense.group.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      {/* Date box */}
      <div className="w-10 shrink-0 flex flex-col items-center bg-gray-100 rounded-xl py-1.5 gap-0">
        <span className="text-[9px] font-semibold text-gray-400 uppercase leading-none tracking-wide">{day}</span>
        <span className="text-[15px] font-bold text-gray-800 leading-snug">{date}</span>
        <span className="text-[9px] text-gray-400 leading-none">{month}</span>
      </div>

      {/* Group DP */}
      <GroupAvatar group={expense.group} />

      {/* Text */}
      <div className="flex-1 min-w-0">
        {/* Line 1: who added what */}
        <p className="text-sm text-gray-900 leading-snug">
          <span className="font-semibold">{who}</span>
          {' added '}
          <span className="font-semibold">"{expense.description}"</span>
        </p>
        {/* Line 2: group name · time */}
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {expense.group.name}
          <span className="mx-1.5">·</span>
          {timeAgo(expense.createdAt)}
        </p>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ActivityPage() {
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey:  ['activity'],
    queryFn:   expensesApi.listAll,
    staleTime: 60_000,
  });

  const groups = groupByDate(expenses);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        {!isLoading && (
          <p className="text-sm text-gray-400 mt-0.5">
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} across all groups
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-10 h-12 bg-gray-100 rounded-xl animate-pulse shrink-0" />
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700">No expenses yet</p>
          <p className="text-sm text-gray-400 mt-1">Expenses added to any group will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(({ label, items }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500">{label}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((e) => (
                  <ActivityRow key={e.id} expense={e} currentUserId={currentUserId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
