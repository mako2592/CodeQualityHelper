import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // Bez tego Vitest zebrałby też testy z examples/sample-project.
    include: ['src/**/*.test.ts'],
  },
});
