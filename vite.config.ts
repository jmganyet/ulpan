/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  base: process.env.BASE ?? '/',
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    globals: false,
  },
})
