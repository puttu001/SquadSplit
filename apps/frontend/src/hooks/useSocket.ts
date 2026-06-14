import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@store/auth.store';
import { useNotificationStore } from '@store/notification.store';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export function useSocketConnection() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const increment   = useNotificationStore((s) => s.increment);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) {
      socket?.disconnect();
      socket = null;
      return;
    }

    socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000', {
      auth: { token: accessToken },
    });

    socket.on('notification:new', () => {
      increment();
    });

    socket.on('expense:created', () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    });

    socket.on('expense:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    });

    socket.on('expense:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [accessToken]);
}

export function joinGroupRoom(groupId: string) {
  socket?.emit('join:group', groupId);
}

export function leaveGroupRoom(groupId: string) {
  socket?.emit('leave:group', groupId);
}
