import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/days-for-girls-solon/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        createNewEvent: resolve(__dirname, 'create-new-event.html'),
        distributedInventory: resolve(__dirname, 'distributed-inventory.html'),
        donate: resolve(__dirname, 'donate.html'),
        donatedInventory: resolve(__dirname, 'donated-inventory.html'),
        eventSignUp: resolve(__dirname, 'event-sign-up.html'),
        events: resolve(__dirname, 'events.html'),
        inventory: resolve(__dirname, 'inventory.html'),
        mailingList: resolve(__dirname, 'mailing-list.html'),
        manageEvent: resolve(__dirname, 'manage-event.html'),
      },
    },
  },
  plugins: [
    VitePWA({
      //Web App Manifest configuration
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      //Workbox configuration
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,json}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      },
      
      //Manifest.json generation
      manifest: {
        name: 'Days for Girls Solon OH',
        short_name: 'Vite PWA',
        description: '',
        theme_color: '#ff9f00',
        background_color: '#e5e5e5',
        display: 'standalone',
        scope: '/days-for-girls-solon/',
        start_url: '/days-for-girls-solon/index.html',
        icons: [
          {
            src: 'https://raw.githubusercontent.com/ryan-montville/days-for-girls-solon/refs/heads/main/images/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://raw.githubusercontent.com/ryan-montville/days-for-girls-solon/refs/heads/main/images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'https://raw.githubusercontent.com/ryan-montville/days-for-girls-solon/refs/heads/main/images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          }
        ],
      }
    })
  ],
});