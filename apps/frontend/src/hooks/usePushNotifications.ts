import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage, VAPID_KEY } from '@/config/firebase';
import { api } from '@services/api';
import toast from 'react-hot-toast';

export function usePushNotifications() {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current || !messaging) return;
    registered.current = true;

    async function register() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const sw = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging!, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw });

        if (token) {
          await api.post('/users/me/fcm-token', { token });
        }
      } catch {
        // Push not supported or permission denied
      }
    }

    register();

    const unsubscribe = onMessage(messaging!, (payload) => {
      const { title, body } = payload.notification ?? {};
      if (title) toast(body ?? title, { icon: '🔔' });
    });

    return () => unsubscribe();
  }, []);
}
