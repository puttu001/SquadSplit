import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import { env } from './env';

let messaging: Messaging | null = null;

if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
  initializeApp({
    credential: cert({
      projectId:   env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey:  env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  messaging = getMessaging();
}

export { messaging };
