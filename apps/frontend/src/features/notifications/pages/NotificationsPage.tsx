import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { notificationsApi } from '../notifications.api';
import { useNotificationStore } from '@store/notification.store';
import { PageSpinner } from '@components/ui';
import { formatRelative } from '@utils/date';
import type { Notification } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveLink(type: string, data?: Record<string, unknown>): string | null {
  switch (type) {
    case 'FRIEND_REQUEST_RECEIVED':
    case 'FRIEND_REQUEST_ACCEPTED':
      return '/friends';
    case 'GROUP_INVITE':
    case 'EXPENSE_ADDED':
    case 'EXPENSE_EDITED':
    case 'EXPENSE_DELETED':
      return data?.groupId ? `/groups/${String(data.groupId)}` : null;
    default:
      return null;
  }
}

function NotifIcon({ type }: { type: string }) {
  const wrap = 'w-9 h-9 rounded-full flex items-center justify-center shrink-0';

  const configs: Record<string, { bg: string; icon: React.ReactNode }> = {
    FRIEND_REQUEST_RECEIVED: {
      bg: 'bg-blue-100',
      icon: (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    FRIEND_REQUEST_ACCEPTED: {
      bg: 'bg-green-100',
      icon: (
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    GROUP_INVITE: {
      bg: 'bg-teal-100',
      icon: (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    MEMBER_REMOVED: {
      bg: 'bg-red-100',
      icon: (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
        </svg>
      ),
    },
    EXPENSE_ADDED: {
      bg: 'bg-violet-100',
      icon: (
        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    EXPENSE_EDITED: {
      bg: 'bg-amber-100',
      icon: (
        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    EXPENSE_DELETED: {
      bg: 'bg-red-100',
      icon: (
        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  };

  const cfg = configs[type] ?? {
    bg: 'bg-gray-100',
    icon: (
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  };

  return <div className={clsx(wrap, cfg.bg)}>{cfg.icon}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { unreadCount, setUnreadCount, reset: resetUnread } = useNotificationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsApi.list(),
  });

  // Keep bell badge in sync with server count
  useEffect(() => {
    if (data?.unreadCount !== undefined) setUnreadCount(data.unreadCount);
  }, [data?.unreadCount, setUnreadCount]);

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      resetUnread();
    },
  });

  function handleClick(n: Notification) {
    if (!n.isRead) {
      notificationsApi.markRead(n.id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          setUnreadCount(Math.max(0, unreadCount - 1));
        })
        .catch(() => {});
    }
    const link = resolveLink(n.type, n.data);
    if (link) navigate(link);
  }

  if (isLoading) return <PageSpinner />;

  const notifications = data?.notifications ?? [];

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {(data?.unreadCount ?? 0) > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{data?.unreadCount} unread</p>
          )}
        </div>
        {(data?.unreadCount ?? 0) > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium text-sm">No notifications yet</p>
            <p className="text-gray-400 text-xs mt-1">Activity from your groups and friends will appear here</p>
          </div>
        ) : (
          notifications.map((n) => {
            const link    = resolveLink(n.type, n.data);
            const isUnread = !n.isRead;
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={clsx(
                  'w-full text-left bg-white rounded-xl border p-4 transition-all',
                  isUnread
                    ? 'border-teal-200 bg-teal-50/40 hover:bg-teal-50/70'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                  link ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <div className="flex items-start gap-3">
                  <NotifIcon type={n.type} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={clsx(
                        'text-sm leading-snug',
                        isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800',
                      )}>
                        {n.title}
                      </p>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                        {formatRelative(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    {link && (
                      <p className="text-xs text-teal-600 font-medium mt-1.5">Tap to view →</p>
                    )}
                  </div>

                  {isUnread && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
