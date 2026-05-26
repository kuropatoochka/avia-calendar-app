import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      svgr({
        include: '**/*.svg',
      }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      // Прокси /api используется в mock-режиме (MSW перехватывает запросы)
      // и когда VITE_API_URL=/api (например, .env.production).
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
