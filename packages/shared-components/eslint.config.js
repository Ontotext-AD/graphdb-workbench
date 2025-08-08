const stencilEslintPlugin = require('@stencil-community/eslint-plugin');
const reactPlugin = require("eslint-plugin-react");
const tsParser = require('@typescript-eslint/parser');
const path = require('node:path');

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
    },
    plugins: {
      react: reactPlugin,
      "@stencil-community": stencilEslintPlugin,
    },
    rules: {
      ...stencilEslintPlugin.configs.recommended.rules,
      "@stencil-community/ban-exported-const-enums": "off",
      "@stencil-community/strict-boolean-conditions": "off"
    },
  },
];
