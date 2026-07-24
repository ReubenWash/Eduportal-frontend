import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'EduPortal — School Management Platform',
        short_name: 'EduPortal',
        description: 'A complete school management SaaS platform for schools, teachers, students, and parents across Ghana and West Africa.',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'browser',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],
        categories: ['education', 'productivity', 'utilities'],
        shortcuts: [
          { name: 'Dashboard', short_name: 'Dashboard', description: 'Go to your dashboard', url: '/dashboard', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
          { name: 'Students',  short_name: 'Students',  description: 'Manage students', url: '/students', icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Always serve the index.html from network first so the app shell
        // never appears blank when the SW is installing for the first time.
        navigateFallback: null,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/eduportal-backend-rorj\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, networkTimeoutSeconds: 10 },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173
  }
})