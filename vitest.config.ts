import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    server: {
      deps: {
        // Externalizează toate built-in-urile node (inclusiv node:sqlite, mai nou decât Vite 5).
        external: [/^node:/],
      },
    },
  },
});
