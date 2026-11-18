import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // 可选：开发时用 /api 代理后端，避免跨域。
            // 默认前端直接请求 VITE_API_BASE（http://localhost:8000）。
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ''); },
            },
        },
    },
});
