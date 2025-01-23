import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

export default defineConfig({
    plugins: [reactRefresh()],
    server: {
        port: 3000,
        hmr: false
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].[ext]`,
                chunkFileNames: `assets/[name].[ext]`,
                assetFileNames: `assets/[name].[ext]`
            }
        }
    }
});