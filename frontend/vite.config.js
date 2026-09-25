import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    root: __dirname,

    server: {
      port: 3000,
      host: '0.0.0.0',

      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: path.resolve(__dirname, '../dist'),
      emptyOutDir: true,
    },
  };
});