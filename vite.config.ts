import { defineConfig } from 'vite';

export default defineConfig({
  // 相對路徑打包：GitHub Pages（含 /repo 子路徑）、Netlify、Vercel 都可直接部署。
  base: './',
  server: {
    port: 5177
  },
  preview: {
    port: 4177
  },
  build: {
    // Three.js 是首屏 3D 沙盤必需的單一引擎 chunk；獨立快取後以 620 kB 作為警示門檻。
    chunkSizeWarningLimit: 620,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three-runtime';
          return undefined;
        }
      }
    }
  }
});
