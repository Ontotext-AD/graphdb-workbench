const stencilEslintPlugin = require('@stencil-community/eslint-plugin');
const reactPlugin = require("eslint-plugin-react");
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: ["**/*cy.js", "cypress.config.js", "src/**/*d.ts"],
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
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
