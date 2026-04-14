import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node20',
  sourcemap: true,
  clean: true,
  dts: false,
  splitting: false,
  onSuccess: 'mkdir -p dist/data && cp data/assets.json dist/data/assets.json',
});
