import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/audio/voice.ts',
        'src/data/genres.ts',
        'src/data/sounds.ts',
        'src/theme/skins.ts',
        'scripts/renderSounds.mjs',
      ],
      exclude: ['**/__tests__/**', '**/*.test.*', '**/*.d.ts'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
