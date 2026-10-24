import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@stupul/domain': src('../../packages/domain/src/index.ts'),
      '@stupul/engine': src('../../packages/engine/src/index.ts'),
      '@stupul/shared': src('../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});


