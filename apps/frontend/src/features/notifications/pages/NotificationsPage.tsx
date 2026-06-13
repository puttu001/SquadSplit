import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../notifications.api';
import { useNotificationStore } from '@store/notification.store';
import { Button, PageSpinner } from '@components/ui';
import { formatRelative } from '@utils/date';
import { clsx } from 'clsx';

export default function NotificationsPage() {
  const queryClient   = useQueryClient();
  const resetUnread   = useNotificationStore((s) => s.reset);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsApi.list(),
  });

  const markAll = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      resetUnread();
    },
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {(data?.unreadCount ?? 0) > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAll.mutate()}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {data?.notifications?.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No notifications yet</p>
        )}
        {data?.notifications?.map((n) => (
          <div
            key={n.id}
            className={clsx(
              'bg-white rounded-xl border p-4 transition-colors',
              n.isRead ? 'border-gray-200' : 'border-primary-200 bg-primary-50/30',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{formatRelative(n.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
