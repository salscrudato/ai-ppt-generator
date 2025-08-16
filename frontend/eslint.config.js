/**
 * ESLint Configuration for AI PowerPoint Generator Frontend
 *
 * Modern flat config format optimized for React + TypeScript development.
 * Provides essential linting rules for code quality and consistency.
 *
 * @version 2.0.0 (Flat Config)
 * @author AI PowerPoint Generator Team
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  // Ignore build outputs and dependencies
  globalIgnores(['dist']),

  {
    // Apply to all TypeScript and TSX files
    files: ['**/*.{ts,tsx}'],

    // Extend recommended configurations
    extends: [
      js.configs.recommended,           // JavaScript best practices
      tseslint.configs.recommended,     // TypeScript-specific rules
      reactHooks.configs['recommended-latest'], // React Hooks rules
      reactRefresh.configs.vite,        // Vite HMR compatibility
    ],

    // Language configuration
    languageOptions: {
      ecmaVersion: 2020,      // Modern JavaScript features
      globals: globals.browser, // Browser environment globals
    },
  },
])
