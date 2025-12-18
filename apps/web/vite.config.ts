import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 4200,
  },
});
