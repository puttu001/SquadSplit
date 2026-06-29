import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            'AIzaSyA5bcSf7tC-_YLgeaAaKdHHCPGDWulwbWU',
  authDomain:        'squadsplit-e3617.firebaseapp.com',
  projectId:         'squadsplit-e3617',
  storageBucket:     'squadsplit-e3617.firebasestorage.app',
  messagingSenderId: '525500384586',
  appId:             '1:525500384586:web:d42581d082ea61cc4dadb3',
};

const VAPID_KEY = 'BJODbVXGak8F3KD_u2_8JIDJGfIlT8O_1VmXCFVeLXtvY4E6K38wfdmT-IVYTbAaVkdjeV05yBCkVY4ZhXjito0';

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;
try {
  messaging = getMessaging(app);
} catch {
  // Messaging not supported (e.g. Safari private browsing)
}

export { messaging, getToken, onMessage, VAPID_KEY };
