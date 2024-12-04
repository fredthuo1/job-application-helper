import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/job-application-helper/', // Updated to the correct repository name
    build: {
        outDir: 'dist', // Ensure the build directory is correct
    },
});
