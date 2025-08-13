/**
 * API Configuration - Optimized for AI PowerPoint Generator
 *
 * Centralized configuration for all API endpoints and base URLs.
 * Automatically switches between development and production environments.
 *
 * Development URLs:
 * - Draft: http://localhost:5001/plsfixthx-ai/us-central1/api/draft
 * - Generate: http://localhost:5001/plsfixthx-ai/us-central1/api/generate
 * - Health: http://localhost:5001/plsfixthx-ai/us-central1/api/health
 *
 * @version 3.1.0-optimized
 */

// Determine the API base URL based on environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://api-rh444yt5aq-uc.a.run.app'
    : 'http://localhost:5001/plsfixthx-ai/us-central1/api');

// API endpoint definitions
export const API_ENDPOINTS = {
  /** Generate slide draft from user parameters */
  draft: `${API_BASE_URL}/draft`,

  /** Generate final PowerPoint file from slide specification */
  generate: `${API_BASE_URL}/generate`,

  /** Health check endpoint */
  health: `${API_BASE_URL}/health`
} as const;
