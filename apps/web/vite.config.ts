import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@stupul/domain': path.resolve(__dirname, '../../packages/domain/src/index.ts'),
      '@stupul/engine': path.resolve(__dirname, '../../packages/engine/src/index.ts'),
      '@stupul/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    }
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: false
  }
});
