const base = require('../../eslint.config.base.js');

module.exports = [
  ...base,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        System: 'readonly',
        PluginRegistry: 'readonly',
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
  {
    ignores: ['**/*.html'],
  },
];
