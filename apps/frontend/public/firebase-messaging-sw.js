importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyA5bcSf7tC-_YLgeaAaKdHHCPGDWulwbWU',
  authDomain:        'squadsplit-e3617.firebaseapp.com',
  projectId:         'squadsplit-e3617',
  storageBucket:     'squadsplit-e3617.firebasestorage.app',
  messagingSenderId: '525500384586',
  appId:             '1:525500384586:web:d42581d082ea61cc4dadb3',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  if (!title) return;
  self.registration.showNotification(title, {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
  });
});
