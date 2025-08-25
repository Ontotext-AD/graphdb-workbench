/**
 * Legacy Workbench ESLint Configuration
 *
 * This package extends the shared base ESLint rules to align with the rest of the packages,
 * but deliberately overrides or disables certain stylistic rules.
 *
 * Why:
 * - The legacy workbench codebase (AngularJS 1.3.8, jQuery, D3, etc.) predates the current coding standards.
 * - Enforcing strict style rules (quotes, indent, max-len, etc.) would produce thousands of lint errors,
 *   blocking development without providing immediate value.
 * - Therefore, these rules are explicitly turned off here to allow incremental maintenance.
 *
 * What remains enforced:
 * - Critical correctness rules from the base (eqeqeq, curly, semi, no-console, no-debugger, etc.).
 * - Google ESLint config rules that still make sense for this codebase.
 *
 * Technical debt:
 * - This configuration is intentionally less strict than other packages.
 * - Long-term, the goal is to clean up or retire this package and remove the overrides.
 *
 * 👉 When we decide to modernize this package:
 *    1. Delete the overrides in the "rules" section below.
 *    2. Rely fully on the shared base ESLint config (and keep only the package-specific globals/ignores).
 */
const googleConfig = require('eslint-config-google');
const base = require('../../eslint.config.base.js');

module.exports = [
  ...base,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        angular: 'readonly',
        $: 'readonly',
        _: 'readonly',
        d3: 'readonly',
        getError: 'readonly',
        window: 'readonly',
        document: 'readonly',
        define: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      ...googleConfig.rules,
      'valid-jsdoc': 'off',
      quotes: 'off',
      indent: 'off',
      'max-len': 'off',
      'require-jsdoc': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'no-tabs': 'off',
      'spaced-comment': 'off',
      'key-spacing': 'off'
    },
  },
];
