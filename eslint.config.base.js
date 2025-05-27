/** Base rules shared across all packages */
module.exports = [
  {
    ignores: ['**/node_modules/**', '**/dist/**'],
    rules: {
      eqeqeq: 'error',
      curly: 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: ['error', 2],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-redeclare': ['error', { builtinGlobals: false }],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-unused-vars': 'warn'
    },
  },
  {
    files: ['**/*.html'],
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    rules: {
      indent: 'off',
    },
  }
];
