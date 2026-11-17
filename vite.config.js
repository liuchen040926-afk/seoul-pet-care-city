import {defineConfig} from 'vite';
export default defineConfig({
  // Works on both https://name.github.io/repository/ and a root/custom domain.
  base: './',
  build: {
    rollupOptions: {
      output: {manualChunks: {react: ['react', 'react-dom/client'], geo: ['d3']}},
    },
  },
});
