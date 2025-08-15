/**
 * Prettier Configuration for AI PowerPoint Generator
 * 
 * Consistent code formatting rules for the entire project.
 * Optimized for readability and maintainability.
 * 
 * @version 1.0.0
 */

module.exports = {
  // ===== BASIC FORMATTING =====
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',

  // ===== JSX FORMATTING =====
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // ===== PROSE FORMATTING =====
  proseWrap: 'preserve',

  // ===== HTML FORMATTING =====
  htmlWhitespaceSensitivity: 'css',

  // ===== VUE FORMATTING =====
  vueIndentScriptAndStyle: false,

  // ===== EMBEDDED LANGUAGE FORMATTING =====
  embeddedLanguageFormatting: 'auto',

  // ===== PLUGIN OVERRIDES =====
  overrides: [
    // ===== MARKDOWN FILES =====
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    // ===== JSON FILES =====
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    // ===== YAML FILES =====
    {
      files: ['*.yml', '*.yaml'],
      options: {
        printWidth: 80,
        tabWidth: 2,
        singleQuote: false,
      },
    },
    // ===== CSS/SCSS FILES =====
    {
      files: ['*.css', '*.scss', '*.less'],
      options: {
        printWidth: 120,
        singleQuote: false,
      },
    },
    // ===== TYPESCRIPT DECLARATION FILES =====
    {
      files: '*.d.ts',
      options: {
        printWidth: 120,
      },
    },
    // ===== CONFIGURATION FILES =====
    {
      files: [
        '*.config.js',
        '*.config.ts',
        '*.config.mjs',
        '.eslintrc.js',
        '.prettierrc.js',
        'tailwind.config.js',
        'vite.config.ts',
        'vitest.config.ts',
      ],
      options: {
        printWidth: 120,
        singleQuote: true,
      },
    },
    // ===== PACKAGE.JSON =====
    {
      files: 'package.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
  ],

  // ===== PLUGIN CONFIGURATIONS =====
  plugins: [
    // Tailwind CSS class sorting
    'prettier-plugin-tailwindcss',
  ],

  // ===== TAILWIND CSS PLUGIN OPTIONS =====
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'cva'],
};
