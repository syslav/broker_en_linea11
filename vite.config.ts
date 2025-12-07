import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // ESTA LÍNEA ES CRUCIAL PARA GITHUB PAGES:
    base: './', 
    define: {
      'process.env': env
    }
  };
});
