/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.BASE ?? '/',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      // L'àudio (milers de fitxers petits) no es precarrega: es desa a mesura que es fa servir.
      includeAssets: ['contingut/*.json', 'fonts/*', 'imatges/*', 'icona.svg', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html}', 'contingut/*.json', 'fonts/*', 'imatges/*'],
        globIgnores: ['audio/**'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.m4a'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ulpan-audio',
              expiration: { maxEntries: 3000 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Hebreu del màster',
        short_name: 'Hebreu',
        lang: 'ca',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#1f2430',
        background_color: '#f6f4ef',
        icons: [
          { src: 'icona-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icona-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icona-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: false,
  },
})
