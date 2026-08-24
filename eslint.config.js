import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['.wxt/**', '.output/**', 'node_modules/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                // WXT auto-imports (defineContentScript, etc.).
                defineContentScript: 'readonly',
            },
        },
    },
    // Node scripts and build config run outside the browser.
    {
        files: ['scripts/**/*.{js,mjs}', '*.config.{js,mjs,ts}'],
        languageOptions: {
            globals: globals.node,
        },
    },
    // Prettier compatibility — turn off formatting-related rules. Keep last.
    prettier,
);
