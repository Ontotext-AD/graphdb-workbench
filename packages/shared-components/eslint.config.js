const stencilEslintPlugin = require('@stencil-community/eslint-plugin');
const reactPlugin = require("eslint-plugin-react");
const tsParser = require('@typescript-eslint/parser');
const path = require('node:path');
const globals = require('globals');
const eslintJs = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: ["**/*cy.js", "cypress.config.js", "**/*d.ts"],
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: path.join(__dirname, 'tsconfig.json'),
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
      "@stencil-community": stencilEslintPlugin,
      js: eslintJs,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...stencilEslintPlugin.configs.recommended.rules,
      "@stencil-community/ban-exported-const-enums": "off",
      "@stencil-community/strict-boolean-conditions": "off",

      ...eslintJs.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs.stylistic.rules,

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
      curly: 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-redeclare': ['error', { builtinGlobals: false }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'no-undef': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
];
