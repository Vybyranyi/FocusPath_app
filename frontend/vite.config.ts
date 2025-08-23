/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: [
        "src/main.tsx",
        "src/App.tsx",
        "src/store/hooks.ts",
        "src/store/store.ts",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/setupTests.ts",
        "vite.config.ts",
        "eslint.config.js",
      ],

    },
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
});