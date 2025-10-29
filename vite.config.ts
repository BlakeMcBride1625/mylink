import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Base URL for production deployment at /myhub/ subdirectory
    base: mode === 'production' ? '/myhub/' : '/',
    server: {
      host: true, // Expose to network for testing real IPs
      port: parseInt(env.FRONTEND_PORT || '1500'),
      proxy: {
        '/api': {
          target: `http://localhost:${env.BACKEND_PORT || '1600'}`,
          changeOrigin: true,
        },
        '/auth': {
          target: `http://localhost:${env.BACKEND_PORT || '1600'}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});


