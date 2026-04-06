// Vite build configuration:
// This file tells Vite how to build and optimize the frontend project.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Enables React support in the Vite development/build pipeline.
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Manual chunking:
        // Splits large dependency groups into separate bundles so the app can cache them better.
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }

          // Firebase is isolated because it is a large dependency used across auth and dashboards.
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor'
          }

          // Recharts is separated because only the admin dashboard needs chart-heavy code.
          if (id.includes('node_modules/recharts')) {
            return 'charts-vendor'
          }
        },
      },
    },
  },
})
