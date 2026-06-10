import { defineConfig } from 'vite';

export default defineConfig({
  // 相對路徑打包：GitHub Pages（含 /repo 子路徑）、Netlify、Vercel 都可直接部署。
  base: './',
  server: {
    port: 5177
  },
  preview: {
    port: 4177
  }
});
