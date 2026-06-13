import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { friendsApi, type Friend, type SearchUser, type FriendRequest } from '../friends.api';
import { Avatar } from '@components/ui';
import { useAuthStore } from '@store/auth.store';

// ─── Add Friend Modal ─────────────────────────────────────────────────────────
function AddFriendModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery]          = useState('');
  const [debouncedQ, setDebounced] = useState('');
  const [sent, setSent]            = useState<Set<string>>(new Set());
  const inputRef                   = useRef<HTMLInputElement>(null);
  const queryClient                = useQueryClient();
  const currentUser                = useAuthStore((s) => s.user);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (open) { setQuery(''); setSent(new Set()); setTimeout(() => inputRef.current?.focus(), 80); }
  }, [open]);

  const { data: results = [], isFetching } = useQuery({
    queryKey:  ['user-search', debouncedQ],
    queryFn:   () => friendsApi.search(debouncedQ),
    enabled:   debouncedQ.length >= 2,
    staleTime: 30_000,
  });

  const sendReq = useMutation({
    mutationFn: (usernameOrEmail: string) => friendsApi.sendRequest(usernameOrEmail),
    onSuccess: (_data, usernameOrEmail) => {
      toast.success('Friend request sent!');
      setSent((prev) => new Set(prev).add(usernameOrEmail));
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to send request'),
  });

  if (!open) return null;
  const filtered = results.filter((u) => u.id !== currentUser?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md z-10 flex flex-col max-h-[80vh]">

        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">Add Friend</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username or email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400"
            />
            {isFetching && (
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {debouncedQ.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Type at least 2 characters to search</p>
            </div>
          ) : filtered.length === 0 && !isFetching ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <p className="text-sm font-medium text-gray-600">No users found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different name, username, or email</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const identifier  = u.username ?? u.id;
                const alreadySent = sent.has(identifier) || sent.has(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3.5">
                    <Avatar name={u.name} src={u.avatarUrl ?? undefined} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                      {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
                    </div>
                    <button
                      disabled={alreadySent || sendReq.isPending}
                      onClick={() => sendReq.mutate(u.username ?? u.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        alreadySent ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {alreadySent ? (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>Sent</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>Add</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Friend row ───────────────────────────────────────────────────────────────
function FriendRow({ friend, onRemove }: { friend: Friend; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Avatar name={friend.name} src={friend.avatarUrl ?? undefined} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{friend.name}</p>
        {friend.username && <p className="text-xs text-gray-400 mt-0.5">@{friend.username}</p>}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Remove friend"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
        </svg>
      </button>
    </div>
  );
}

// ─── Request row ──────────────────────────────────────────────────────────────
function RequestRow({ req, onRespond }: { req: FriendRequest; onRespond: (action: 'accept' | 'reject') => void }) {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);

  async function handle(action: 'accept' | 'reject') {
    setLoading(action);
    try { await onRespond(action); } finally { setLoading(null); }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <Avatar name={req.sender.name} src={req.sender.avatarUrl ?? undefined} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{req.sender.name}</p>
        {req.sender.username && <p className="text-xs text-gray-400 mt-0.5">@{req.sender.username}</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => handle('reject')}
          disabled={!!loading}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {loading === 'reject' ? '…' : 'Decline'}
        </button>
        <button
          onClick={() => handle('accept')}
          disabled={!!loading}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors"
        >
          {loading === 'accept' ? '…' : 'Accept'}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const [tab, setTab]         = useState<'friends' | 'requests'>('friends');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch]   = useState('');
  const queryClient           = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn:  friendsApi.list,
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['friend-requests'],
    queryFn:  friendsApi.listRequests,
    refetchInterval: 30_000,
  });

  const removeFriend = useMutation({
    mutationFn: (id: string) => friendsApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['friends'] }); toast.success('Friend removed'); },
    onError:   () => toast.error('Failed to remove friend'),
  });

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'reject' }) =>
      friendsApi.respondRequest(id, action),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success(action === 'accept' ? 'Friend request accepted!' : 'Request declined');
    },
    onError: () => toast.error('Failed to respond to request'),
  });

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.username ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const pendingCount = requests.length;

  return (
    <>
      <AddFriendModal open={showAdd} onClose={() => setShowAdd(false)} />

      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
            {!loadingFriends && (
              <p className="text-sm text-gray-400 mt-0.5">
                {friends.length} friend{friends.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-teal-600/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Friend
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === 'friends' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              tab === 'requests' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Requests
            {pendingCount > 0 && (
              <span className="bg-teal-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Friends tab ── */}
        {tab === 'friends' && (
          <>
            {friends.length > 0 && (
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search friends…"
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 shadow-sm"
                />
              </div>
            )}

            {loadingFriends ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-700">No friends yet</p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  Add friends to split expenses with them easily across groups.
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="mt-5 flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-teal-600/25"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Your First Friend
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">No friends matching "{search}"</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((f) => (
                  <FriendRow
                    key={f.id}
                    friend={f}
                    onRemove={() => {
                      if (confirm(`Remove ${f.name} from friends?`)) removeFriend.mutate(f.id);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Requests tab ── */}
        {tab === 'requests' && (
          <>
            {loadingRequests ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-700">No pending requests</p>
                <p className="text-sm text-gray-400 mt-1">Friend requests you receive will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map((req) => (
                  <RequestRow
                    key={req.id}
                    req={req}
                    onRespond={(action) => respond.mutateAsync({ id: req.id, action })}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
