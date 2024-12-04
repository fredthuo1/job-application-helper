import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/job-application-helper/vite-project/', // Correct deployment path for GitHub Pages
});
