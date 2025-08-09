import { defineConfig } from 'vite';

export default defineConfig({
  base: '/STG/',
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, 
  },
});
