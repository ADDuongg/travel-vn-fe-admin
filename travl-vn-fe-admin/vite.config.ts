import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const dropConsole = env.VITE_DROP_CONSOLE === 'true';
  const port = env.VITE_APP_PORT ? Number(env.VITE_APP_PORT) : 3000;

  return {
    plugins: [react()],
    server: {
      port,
      open: true,
      cors: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@interface': path.resolve(__dirname, 'src/interface'),
        '@store': path.resolve(__dirname, 'src/store'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    esbuild: {
      drop: dropConsole ? ['console', 'debugger'] : [],
    },
  };
});
