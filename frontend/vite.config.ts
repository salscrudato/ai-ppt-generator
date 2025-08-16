/**
 * Vite Configuration for AI PowerPoint Generator Frontend
 *
 * Optimized build configuration for React + TypeScript development.
 * Provides fast HMR, efficient bundling, and development server setup.
 *
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // React plugin with Fast Refresh for optimal development experience
  plugins: [react()],

  // Development server configuration
  server: {
    // Enable network access for testing on multiple devices
    host: true,
    // Default port (can be overridden with --port)
    port: 5173,
    // Automatically open browser in development
    open: false
  },

  // Build optimization
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    // Optimize bundle size
    minify: 'esbuild',
    // Target modern browsers for better performance
    target: 'es2020'
  }
})
