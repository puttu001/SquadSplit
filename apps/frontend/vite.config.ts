import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name:             'SquadSplit',
        short_name:       'SquadSplit',
        description:      'Split expenses with friends, effortlessly',
        theme_color:      '#0d9488',
        background_color: '#ffffff',
        display:          'standalone',
        scope:            '/',
        start_url:        '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback:          '/index.html',
        navigateFallbackDenylist:  [/^\/api/, /^\/socket\.io/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler:    'CacheFirst',
            options:    { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler:    'CacheFirst',
            options:    { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler:    'CacheFirst',
            options:    { cacheName: 'cloudinary-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@':           path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features':   path.resolve(__dirname, 'src/features'),
      '@hooks':      path.resolve(__dirname, 'src/hooks'),
      '@services':   path.resolve(__dirname, 'src/services'),
      '@store':      path.resolve(__dirname, 'src/store'),
      '@utils':      path.resolve(__dirname, 'src/utils'),
      '@types':      path.resolve(__dirname, 'src/types'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target:       'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        ws:           true,
      },
    },
  },
});
