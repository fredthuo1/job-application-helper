import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/job-application-helper/vite-project/', // Specify the GitHub Pages deployment path
    build: {
        outDir: 'dist', // Ensure the build directory is correctly set
    },
});
