import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The footer's copyright year, fixed at build time so the prerendered HTML
  // and the browser always agree.
  define: { 'import.meta.env.VITE_BUILD_YEAR': JSON.stringify(String(new Date().getFullYear())) },
  // scripts/prerender.mjs reads the manifest to preload each page's language chunk.
  build: { manifest: true },
});
