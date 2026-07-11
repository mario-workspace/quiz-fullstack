import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['apps/api/src/**/*.ts', 'apps/web/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        'apps/api/src/db/migrate.ts',
        'apps/api/src/index.ts',
        'apps/web/.next/**',
        'apps/web/app/**',
        'apps/web/next-env.d.ts',
      ],
    },
    include: ['apps/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', 'e2e/**'],
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, './apps/api/src'),
      '@web': path.resolve(__dirname, './apps/web'),
      '@': path.resolve(__dirname, './apps/web'),
      '@shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});
