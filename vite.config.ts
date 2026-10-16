import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { pluginSite } from './build/plugin-site.ts';

export default defineConfig({
  plugins: [react(), pluginSite()],
  build: {
    target: 'es2022',
    cssTarget: 'chrome100',
    sourcemap: false,
  },
});
