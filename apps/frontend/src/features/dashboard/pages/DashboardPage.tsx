import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../dashboard.api';
import { groupsApi } from '@features/groups/groups.api';
import { CreateGroupModal } from '@features/groups/components/CreateGroupModal';
import { useAuthStore } from '@store/auth.store';
import { formatCurrency } from '@utils/currency';
import toast from 'react-hot-toast';
import type { Group } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COVER_GRADIENTS = [
  'from-blue-400 to-cyan-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-600',
  'from-teal-400 to-emerald-600',
  'from-indigo-400 to-blue-700',
  'from-green-400 to-teal-600',
  'from-yellow-400 to-amber-600',
];

const AVATAR_COLORS = [
  'bg-red-400',    'bg-blue-400',   'bg-green-400',
  'bg-purple-400', 'bg-yellow-400', 'bg-pink-400',
  'bg-indigo-400', 'bg-teal-500',
];

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function avatarBg(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

type FilterType = 'unsettled' | 'settled';

// ─── Member avatar stack ──────────────────────────────────────────────────────
function AvatarStack({ members }: { members: Group['members'] }) {
  const show  = members.slice(0, 3);
  const extra = members.length - show.length;
  return (
    <div className="flex items-center">
      {show.map((m, i) => (
        <div
          key={m.id}
          title={m.user.name}
          className={`w-7 h-7 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${avatarBg(m.user.name)}`}
          style={{ marginLeft: i === 0 ? 0 : '-8px' }}
        >
          {m.user.avatarUrl
            ? <img src={m.user.avatarUrl} alt={m.user.name} className="w-full h-full rounded-full object-cover" />
            : initials(m.user.name)
          }
        </div>
      ))}
      {extra > 0 && (
        <div
          className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center shrink-0"
          style={{ marginLeft: '-8px' }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

// ─── Group card (desktop) ─────────────────────────────────────────────────────
function GroupCard({ group, index }: { group: Group; index: number }) {
  const navigate    = useNavigate();
  const gradient    = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const memberCount = group.members.length;

  const emojiMatch = group.name.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
  const emoji      = emojiMatch?.[0] ?? '';
  const nameClean  = group.name.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim();

  return (
    <button
      onClick={() => navigate(`/groups/${group.id}`)}
      className="group bg-white rounded-2xl shadow-sm shadow-gray-200 border border-gray-100 overflow-hidden hover:shadow-md hover:shadow-gray-200 hover:-translate-y-0.5 transition-all duration-200 text-left w-full"
    >
      {/* Cover */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {group.imageUrl
          ? <img src={group.imageUrl} alt={group.name} className="absolute inset-0 w-full h-full object-cover" />
          : <span className="text-5xl select-none">{emoji || '🏷️'}</span>
        }
        <div className="absolute bottom-3 left-3">
          <AvatarStack members={group.members} />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {nameClean}{emoji ? ` ${emoji}` : ''}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            group.isSettled
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {group.isSettled ? 'Settled' : 'Unsettled'}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">View details</span>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// ─── Group row (mobile) ───────────────────────────────────────────────────────
function GroupRow({ group, index }: { group: Group; index: number }) {
  const navigate    = useNavigate();
  const gradient    = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const memberCount = group.members.length;
  const emojiMatch  = group.name.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
  const emoji       = emojiMatch?.[0] ?? '';

  return (
    <button
      onClick={() => navigate(`/groups/${group.id}`)}
      className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left"
    >
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
        {group.imageUrl
          ? <img src={group.imageUrl} alt={group.name} className="w-full h-full rounded-xl object-cover" />
          : <span className="text-2xl">{emoji || '🏷️'}</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{group.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
        <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
          group.isSettled
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {group.isSettled ? 'Settled' : 'Unsettled'}
        </span>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-gray-400">View</span>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

// ─── Empty states ─────────────────────────────────────────────────────────────
function EmptyGroups({ filter }: { filter: FilterType }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      {filter === 'settled' ? (
        <>
          <p className="text-sm font-semibold text-gray-700">No settled groups</p>
          <p className="text-xs text-gray-400 mt-1">Groups with all balances cleared will appear here</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-700">No groups yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first group to start splitting expenses</p>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user      = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const [filter, setFilter]           = useState<FilterType>('unsettled');
  const [showCreate, setShowCreate]   = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient                   = useQueryClient();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowCreate(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: summary } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  dashboardApi.getDashboard,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn:  groupsApi.list,
  });

  const createGroup = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowCreate(false);
      toast.success('Group created!');
    },
    onError: () => toast.error('Failed to create group'),
  });

  const filteredGroups = groups.filter((g) => filter === 'settled' ? g.isSettled : !g.isSettled);

  return (
    <>
      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(data) => createGroup.mutate(data)}
        isPending={createGroup.isPending}
      />
    <div className="max-w-6xl mx-auto flex flex-col gap-6">

      {/* ── Welcome ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}! 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your expenses.</p>
      </div>

      {/* ── Balance summary cards ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* You Owe */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium leading-tight">You Owe</p>
            <p className="text-base font-bold text-red-500 tabular-nums truncate leading-tight mt-0.5">
              {formatCurrency(summary?.totalOwed ?? 0)}
            </p>
          </div>
        </div>

        {/* You Are Owed */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7L7 17M7 17h10M7 17V7" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium leading-tight">You're Owed</p>
            <p className="text-base font-bold text-green-500 tabular-nums truncate leading-tight mt-0.5">
              {formatCurrency(summary?.totalReceivable ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Your Groups ── */}
      <section>
        {/* Section header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mr-2">Your Groups</h2>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['unsettled', 'settled'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* New Group button */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-teal-600/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Group
          </button>
        </div>

        {/* Desktop: grid cards */}
        {groupsLoading ? (
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 h-56 animate-pulse">
                <div className="h-36 bg-gray-100 rounded-t-2xl" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="hidden sm:grid">
            <EmptyGroups filter={filter} />
          </div>
        ) : (
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGroups.map((g, i) => (
              <GroupCard key={g.id} group={g} index={i} />
            ))}
          </div>
        )}

        {/* Mobile: list view */}
        {groupsLoading ? (
          <div className="sm:hidden flex flex-col gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="sm:hidden">
            <EmptyGroups filter={filter} />
          </div>
        ) : (
          <div className="sm:hidden flex flex-col gap-3">
            {filteredGroups.map((g, i) => (
              <GroupRow key={g.id} group={g} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
    </>
  );
}
