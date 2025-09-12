const path = require('node:path');
const base = require('../../eslint.config.base.js');
const tseslint = require('typescript-eslint');

module.exports = [
  ...base,
  ...tseslint.config(
    {
      files: ['**/*.ts'],
      extends: [
        ...tseslint.configs.recommended,
        ...tseslint.configs.stylistic,
      ],
      languageOptions: {
        parserOptions: {
          project: path.join(__dirname, 'tsconfig.json'),
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        'no-undef': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
      },
    },
  ),
];
