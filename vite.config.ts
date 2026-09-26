import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — относительные пути, поэтому сборка работает на GitHub Pages
// в любой папке (username.github.io/<repo>/) и на собственном домене.
export default defineConfig({
  base: './',
  plugins: [react()],
});
